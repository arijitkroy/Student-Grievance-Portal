import { randomUUID, createHash } from "crypto";

export const createTrackingCode = () => {
  return randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
};

export const hashTrackingCode = (code) => {
  if (!code) return null;
  return createHash("sha256").update(code).digest("hex");
};
