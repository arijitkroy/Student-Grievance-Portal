import { adminAuth, adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { USER_ROLES } from "@/lib/models";

const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE;

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
    const { email, password, displayName, role, department, adminInviteCode } = req.body || {};

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

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    await adminDb.collection("users").doc(userRecord.uid).set({
      displayName,
      email,
      role,
      department: department || null,
      anonymous: false,
      createdAt: adminTimestamp.now(),
      updatedAt: adminTimestamp.now(),
    });

    return res.status(201).json({
      message: "User registered successfully",
      userId: userRecord.uid,
    });
  } catch (error) {
    console.error("Register error", error);
    return res.status(400).json({ message: error.message || "Failed to register" });
  }
}
