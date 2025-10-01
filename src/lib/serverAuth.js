import { getSessionCookie, verifySessionCookie } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { USER_ROLES } from "@/lib/models";

export const requireAuth = async (
  req,
  res,
  { allowRoles = USER_ROLES, allowAnonymousUser = false } = {}
) => {
  const sessionCookie = getSessionCookie(req);
  const decodedClaims = await verifySessionCookie(sessionCookie);

  if (!decodedClaims) {
    if (res) {
      res.status(401).json({ message: "Authentication required" });
    }
    throw new Error("UNAUTHENTICATED");
  }

  const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();
  if (!userDoc.exists) {
    if (res) {
      res.status(403).json({ message: "User profile not found" });
    }
    throw new Error("USER_PROFILE_NOT_FOUND");
  }

  const user = { id: decodedClaims.uid, ...userDoc.data() };

  if (!allowAnonymousUser && user.anonymous) {
    if (res) {
      res.status(403).json({ message: "Anonymous users cannot access this resource" });
    }
    throw new Error("ANONYMOUS_NOT_ALLOWED");
  }

  if (!allowRoles.includes(user.role)) {
    if (res) {
      res.status(403).json({ message: "Insufficient permissions" });
    }
    throw new Error("FORBIDDEN");
  }

  req.user = user;
  return user;
};

export const optionalAuth = async (req) => {
  const sessionCookie = getSessionCookie(req);
  const decodedClaims = await verifySessionCookie(sessionCookie);

  if (!decodedClaims) {
    return null;
  }

  const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();

  if (!userDoc.exists) {
    return null;
  }

  const user = { id: decodedClaims.uid, ...userDoc.data() };
  req.user = user;
  return user;
};
