import { randomUUID, createHash } from "crypto";
import { adminAuth, adminDb, adminTimestamp, adminFieldValue } from "@/lib/firebaseAdmin";
import { sendRegistrationOtpEmail } from "@/lib/mailer";
import { USER_ROLES } from "@/lib/models";

const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE;
const OTP_COLLECTION = "registrationOtps";
const OTP_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const hashValue = (value) => createHash("sha256").update(value).digest("hex");

const validatePayload = ({ email, password, displayName, role }) => {
  if (!email || !password || !displayName || !role) {
    throw new Error("Missing required fields");
  }

  if (!USER_ROLES.includes(role)) {
    throw new Error("Invalid role");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const {
      step = "initiate",
      email,
      password,
      displayName,
      role,
      department,
      adminInviteCode,
      sessionId,
      otp,
    } = req.body || {};

    if (step === "initiate") {
      validatePayload({ email, password, displayName, role });

      if (role === "admin") {
        if (!ADMIN_INVITE_CODE) {
          return res.status(500).json({ message: "Admin invite code not configured" });
        }
        if (adminInviteCode !== ADMIN_INVITE_CODE) {
          return res.status(403).json({ message: "Invalid admin invite code" });
        }
      }

      const existingUser = await adminAuth
        .getUserByEmail(email)
        .then((user) => user)
        .catch(() => null);

      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const pendingCollection = adminDb.collection(OTP_COLLECTION);
      const existingSessionSnapshot = await pendingCollection
        .where("email", "==", email)
        .get();

      if (!existingSessionSnapshot.empty) {
        const batch = adminDb.batch();
        existingSessionSnapshot.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAtDate = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
      const expiresAt = adminTimestamp.fromDate(expiresAtDate);
      const newSessionId = randomUUID();

      await pendingCollection.doc(newSessionId).set({
        email,
        displayName,
        role,
        department: department || null,
        adminInviteCode: role === "admin" ? adminInviteCode : null,
        passwordHash: hashValue(password),
        otpHash: hashValue(generatedOtp),
        expiresAt,
        attempts: 0,
        createdAt: adminTimestamp.now(),
      });

      try {
        await sendRegistrationOtpEmail({
          to: email,
          displayName,
          otp: generatedOtp,
          expiresAt: expiresAtDate.toISOString(),
        });
      } catch (emailError) {
        console.error("Failed to send registration OTP email", emailError);
        await pendingCollection.doc(newSessionId).delete();
        return res.status(502).json({ message: "Failed to send verification email" });
      }

      return res.status(200).json({
        message: "OTP sent successfully. Please verify to complete registration.",
        sessionId: newSessionId,
        expiresAt: expiresAtDate.toISOString(),
        ...(IS_PRODUCTION ? {} : { otp: generatedOtp }),
      });
    }

    if (step === "verify") {
      if (!sessionId || !otp || !password) {
        return res.status(400).json({ message: "Missing verification parameters" });
      }

      const sessionRef = adminDb.collection(OTP_COLLECTION).doc(sessionId);
      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists) {
        return res.status(404).json({ message: "Verification session not found" });
      }

      const sessionData = sessionDoc.data();

      const now = new Date();
      const expiresAt = sessionData.expiresAt?.toDate?.() || null;
      if (!expiresAt || expiresAt < now) {
        await sessionRef.delete();
        return res.status(410).json({ message: "OTP expired. Please register again." });
      }

      if (sessionData.attempts >= MAX_OTP_ATTEMPTS) {
        await sessionRef.delete();
        return res.status(429).json({ message: "Too many invalid attempts. Please register again." });
      }

      const providedOtpHash = hashValue(otp);
      if (providedOtpHash !== sessionData.otpHash) {
        await sessionRef.update({ attempts: adminFieldValue.increment(1) });
        return res.status(403).json({ message: "Invalid OTP" });
      }

      const providedPasswordHash = hashValue(password);
      if (providedPasswordHash !== sessionData.passwordHash) {
        return res.status(400).json({ message: "Password does not match initial submission" });
      }

      const existingUser = await adminAuth
        .getUserByEmail(sessionData.email)
        .then((user) => user)
        .catch(() => null);

      if (existingUser) {
        await sessionRef.delete();
        return res.status(409).json({ message: "User already exists" });
      }

      const userRecord = await adminAuth.createUser({
        email: sessionData.email,
        password,
        displayName: sessionData.displayName,
      });

      await adminAuth.setCustomUserClaims(userRecord.uid, { role: sessionData.role });

      await adminDb.collection("users").doc(userRecord.uid).set({
        displayName: sessionData.displayName,
        email: sessionData.email,
        role: sessionData.role,
        department: sessionData.department || null,
        anonymous: false,
        createdAt: adminTimestamp.now(),
        updatedAt: adminTimestamp.now(),
      });

      await sessionRef.delete();

      return res.status(201).json({
        message: "User registered successfully",
        userId: userRecord.uid,
      });
    }

    return res.status(400).json({ message: "Invalid registration step" });
  } catch (error) {
    console.error("Register error", error);
    return res.status(400).json({ message: error.message || "Failed to register" });
  }
}
