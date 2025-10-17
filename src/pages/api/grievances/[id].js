import { requireAuth } from "@/lib/serverAuth";
import {
  getGrievanceById,
  updateGrievanceStatus,
  addGrievanceComment,
  assignGrievance,
  escalateGrievance,
  submitResolutionFeedback,
} from "@/lib/grievances";
import { adminDb } from "@/lib/firebaseAdmin";
import { createNotification, notifyAdmins } from "@/lib/notifications";

const sanitizeGrievanceForNonOwner = (grievance) => {
  if (!grievance) return null;
  if (grievance.anonymous) {
    const { trackingHash, ...rest } = grievance;
    return rest;
  }
  return grievance;
};

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Missing grievance id" });
  }

  if (req.method === "GET") {
    try {
      const user = await requireAuth(req, res, { allowAnonymousUser: true });
      const grievance = await getGrievanceById(id);

      if (!grievance) {
        return res.status(404).json({ message: "Grievance not found" });
      }

      const isOwner = grievance.createdBy === user.id;
      const isAdmin = user.role === "admin";
      const isAssigned = grievance.assignedTo && grievance.assignedTo === user.department;

      if (!isOwner && !isAdmin && !isAssigned) {
        return res.status(403).json({ message: "Access denied" });
      }

      return res.status(200).json({ grievance: sanitizeGrievanceForNonOwner(grievance) });
    } catch (error) {
      if (!res.headersSent) {
        const statusCode = error.message === "UNAUTHENTICATED" ? 401 : 500;
        res.status(statusCode).json({ message: error.message || "Failed to load grievance" });
      }
      return;
    }
  }

  if (req.method === "PATCH") {
    try {
      const user = await requireAuth(req, res, { allowAnonymousUser: false });
      const grievance = await getGrievanceById(id);

      if (!grievance) {
        return res.status(404).json({ message: "Grievance not found" });
      }

      const { action, status, comment, assignedTo, rating } = req.body || {};

      if (!action) {
        return res.status(400).json({ message: "Missing action" });
      }

      const isOwner = grievance.createdBy === user.id;
      const isAdmin = user.role === "admin";

      if (action === "status") {
        if (!isAdmin) {
          return res.status(403).json({ message: "Only admins can update status" });
        }
        const historyEntry = await updateGrievanceStatus({
          grievanceId: id,
          status,
          comment,
          updatedBy: user.id,
        });

        if (grievance.createdBy) {
          await createNotification({
            grievanceId: id,
            recipientId: grievance.createdBy,
            message: `Status updated to ${status.replace("_", " ")}`,
          });
        }

        return res.status(200).json({ message: "Status updated", historyEntry });
      }

      if (action === "comment") {
        if (!isOwner && !isAdmin) {
          return res.status(403).json({ message: "Not permitted to comment" });
        }

        const historyEntry = await addGrievanceComment({
          grievanceId: id,
          comment,
          updatedBy: user.id,
        });

        const commenterName = user.displayName || user.email || "User";

        const recipients = new Set();
        if (grievance.createdBy && grievance.createdBy !== user.id) {
          recipients.add(grievance.createdBy);
        }
        if (isAdmin) {
          const committeeMembers = await adminDb
            .collection("users")
            .where("role", "==", "admin")
            .get();
          committeeMembers.docs.forEach((doc) => {
            if (doc.id !== user.id) recipients.add(doc.id);
          });
        } else {
          await notifyAdmins({ grievanceId: id, message: `New comment from ${commenterName}` });
        }

        await Promise.all(
          Array.from(recipients).map((recipientId) =>
            createNotification({
              grievanceId: id,
              recipientId,
              message: `New comment from ${commenterName}`,
            })
          )
        );

        return res.status(200).json({ message: "Comment added", historyEntry });
      }

      if (action === "assign") {
        if (!isAdmin) {
          return res.status(403).json({ message: "Only admins can assign" });
        }

        const historyEntry = await assignGrievance({
          grievanceId: id,
          assignedTo,
          updatedBy: user.id,
        });

        if (grievance.createdBy) {
          await createNotification({
            grievanceId: id,
            recipientId: grievance.createdBy,
            message: assignedTo
              ? `Grievance assigned to ${assignedTo}`
              : "Grievance assignment updated",
          });
        }

        return res.status(200).json({ message: "Assignment updated", historyEntry });
      }

      if (action === "escalate") {
        if (!isAdmin) {
          return res.status(403).json({ message: "Only admins can escalate" });
        }

        const historyEntry = await escalateGrievance({
          grievanceId: id,
          comment,
          updatedBy: user.id,
        });

        if (grievance.createdBy) {
          await createNotification({
            grievanceId: id,
            recipientId: grievance.createdBy,
            message: "Your grievance has been escalated",
          });
        }

        return res.status(200).json({ message: "Grievance escalated", historyEntry });
      }

      if (action === "feedback") {
        if (!isOwner) {
          return res.status(403).json({ message: "Only the reporter can submit feedback" });
        }

        if (grievance.status !== "resolved") {
          return res.status(400).json({ message: "Feedback allowed only after resolution" });
        }

        if (grievance.resolutionFeedback) {
          return res.status(400).json({ message: "Feedback already submitted" });
        }

        const historyEntry = await submitResolutionFeedback({
          grievanceId: id,
          rating,
          comment,
          updatedBy: user.id,
        });

        await notifyAdmins({
          grievanceId: id,
          message: "Feedback submitted on a grievance",
        });

        return res
          .status(200)
          .json({ message: "Feedback submitted", historyEntry });
      }

      return res.status(400).json({ message: "Unsupported action" });
    } catch (error) {
      console.error("Grievance update error", error);
      if (!res.headersSent) {
        res.status(400).json({ message: error.message || "Failed to update grievance" });
      }
      return;
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ message: "Method Not Allowed" });
}
