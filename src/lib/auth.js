import { serialize, parse } from "cookie";
import { adminAuth } from "@/lib/firebaseAdmin";

const SESSION_COOKIE_NAME = "grievance_session";
const SESSION_MAX_AGE_DAYS = 5;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export const createSessionCookie = async (idToken) => {
  const expiresIn = SESSION_MAX_AGE_MS;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn,
  });

  return {
    name: SESSION_COOKIE_NAME,
    value: sessionCookie,
    options: {
      maxAge: SESSION_MAX_AGE_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  };
};

export const clearSessionCookie = () => ({
  name: SESSION_COOKIE_NAME,
  value: "",
  options: {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
});

export const parseCookies = (req) => {
  if (!req?.headers?.cookie) return {};
  return parse(req.headers.cookie);
};

export const getSessionCookie = (req) => {
  const cookies = parseCookies(req);
  return cookies[SESSION_COOKIE_NAME];
};

export const verifySessionCookie = async (sessionCookie) => {
  if (!sessionCookie) return null;
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error("Failed to verify session cookie", error);
    return null;
  }
};

export const destroySession = (res) => {
  const { name, value, options } = clearSessionCookie();
  res.setHeader("Set-Cookie", serialize(name, value, options));
};

export const setSession = (res, cookie) => {
  const { name, value, options } = cookie;
  res.setHeader("Set-Cookie", serialize(name, value, options));
};
