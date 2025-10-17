import { getSessionCookie, verifySessionCookie } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { USER_ROLES } from "@/lib/models";

const createAuthError = (code, status, clientMessage) => {
  const error = new Error(code);
  error.status = status;
  error.clientMessage = clientMessage;
  return error;
};

export const requireAuth = async (
  req,
  _res,
  { allowRoles = USER_ROLES, allowAnonymousUser = false } = {}
) => {
  const sessionCookie = getSessionCookie(req);
  const decodedClaims = await verifySessionCookie(sessionCookie);

  if (!decodedClaims) {
    throw createAuthError("UNAUTHENTICATED", 401, "Authentication required");
  }

  const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();
  if (!userDoc.exists) {
    throw createAuthError("USER_PROFILE_NOT_FOUND", 403, "User profile not found");
  }

  const user = { id: decodedClaims.uid, ...userDoc.data() };

  if (!allowAnonymousUser && user.anonymous) {
    throw createAuthError("ANONYMOUS_NOT_ALLOWED", 403, "Anonymous users cannot access this resource");
  }

  if (!allowRoles.includes(user.role)) {
    throw createAuthError("FORBIDDEN", 403, "Insufficient permissions");
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
