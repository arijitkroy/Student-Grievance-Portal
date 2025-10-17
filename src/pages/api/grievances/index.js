import formidable from "formidable";
import fs from "fs/promises";
import { requireAuth, optionalAuth } from "@/lib/serverAuth";
import {
  generateGrievanceNumber,
  validateGrievancePayload,
  createGrievanceHistoryEntry,
} from "@/lib/grievances";
import { adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { encodeFileBuffer } from "@/lib/storage";
import { notifyAdmins, createNotification } from "@/lib/notifications";
import { createTrackingCode, hashTrackingCode } from "@/lib/tracking";
import { serializeCollection } from "@/lib/serializers";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

const normalizeFiles = (files = {}) => {
  if (!files.attachments) return [];
  const { attachments } = files;
  if (Array.isArray(attachments)) return attachments;
  return [attachments];
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const user = await requireAuth(req, res, { allowAnonymousUser: true });
      const { status, category, assignedTo, limit = 50, includeAnonymous = false } = req.query;

      let query = adminDb.collection("grievances");

      if (user.role !== "admin") {
        query = query.where("createdBy", "==", user.id);
      }

      if (status) {
        query = query.where("status", "==", status);
      }

      if (category) {
        query = query.where("category", "==", category);
      }

      if (assignedTo) {
        query = query.where("assignedTo", "==", assignedTo);
      }

      const snapshot = await query.orderBy("createdAt", "desc").limit(Number(limit) || 50).get();

      const grievances = serializeCollection(snapshot).filter((grievance) =>
        includeAnonymous || !grievance.anonymous
      );

      return res.status(200).json({ grievances });
    } catch (error) {
      if (!res.headersSent) {
        const statusCode = error.message === "UNAUTHENTICATED" ? 401 : 500;
        res.status(statusCode).json({ message: error.message || "Failed to load grievances" });
      }
      return;
    }
  }

  if (req.method === "POST") {
    try {
      const user = await optionalAuth(req);
      const { fields, files } = await parseForm(req);

      const getFieldValue = (value) => {
        if (Array.isArray(value)) {
          return value[0];
        }
        return value;
      };

      const category = (getFieldValue(fields.category) || "").toString().trim();
      const title = (getFieldValue(fields.title) || "").toString();
      const description = (getFieldValue(fields.description) || "").toString();
      const assignedToValue = getFieldValue(fields.assignedTo);
      const assignedTo = assignedToValue ? assignedToValue.toString().trim() || null : null;
      const anonymousField = getFieldValue(fields.anonymous);
      const anonymous = anonymousField === "true";
      const initialCommentValue = getFieldValue(fields.initialComment);
      const initialComment = initialCommentValue ? initialCommentValue.toString() : "";

      if (!user && !anonymous) {
        return res.status(401).json({ message: "Authentication required" });
      }

      validateGrievancePayload({ category, title, description });

      const grievanceNumber = await generateGrievanceNumber();
      const fileUploads = normalizeFiles(files);

      const attachments = [];
      for (const file of fileUploads) {
        if (!file) continue;
        const buffer = await fs.readFile(file.filepath);
        if (buffer.length > 2 * 1024 * 1024) {
          throw new Error("Attachments must be under 2MB");
        }

        const encoded = await encodeFileBuffer({
          buffer,
          originalName: file.originalFilename,
          contentType: file.mimetype,
        });
        if (encoded) {
          attachments.push(encoded);
        }
      }

      const grievanceRef = adminDb.collection("grievances").doc();

      const historyEntry = createGrievanceHistoryEntry({
        type: "status",
        status: "submitted",
        comment: initialComment,
        updatedBy: user?.id || "anonymous",
      });

      const baseData = {
        grievanceNumber,
        createdBy: anonymous ? null : user.id,
        category,
        title,
        description,
        attachments,
        status: "submitted",
        assignedTo,
        history: [historyEntry],
        anonymous,
        resolutionFeedback: null,
        escalationLevel: 0,
        createdAt: adminTimestamp.now(),
        updatedAt: adminTimestamp.now(),
      };

      let trackingCode = null;
      if (anonymous) {
        trackingCode = createTrackingCode();
        baseData.trackingHash = hashTrackingCode(trackingCode);
      }

      await grievanceRef.set(baseData);

      await notifyAdmins({
        grievanceId: grievanceRef.id,
        message: `New grievance submitted: ${title}`,
      });

      if (user?.id) {
        await createNotification({
          grievanceId: grievanceRef.id,
          recipientId: user.id,
          message: "Your grievance has been successfully submitted.",
        });
      }

      return res.status(201).json({
        message: "Grievance created",
        grievanceId: grievanceRef.id,
        grievanceNumber,
        trackingCode,
      });
    } catch (error) {
      console.error("Grievance creation error", error);
      return res.status(400).json({ message: error.message || "Failed to create grievance" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Method Not Allowed" });
}
