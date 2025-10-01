import { initializeApp, getApps, applicationDefault, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

const normalizeServiceAccount = (input) => {
  if (!input) return null;

  const privateKey = (input.private_key || input.privateKey || "").replace(/\\n/g, "\n");

  const normalized = {
    projectId: input.project_id || input.projectId || null,
    clientEmail: input.client_email || input.clientEmail || null,
    privateKey: privateKey || null,
  };

  if (input.private_key_id || input.privateKeyId) {
    normalized.privateKeyId = input.private_key_id || input.privateKeyId;
  }

  return normalized;
};

const buildServiceAccountFromEnv = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID;

  if (projectId && clientEmail && privateKey) {
    return normalizeServiceAccount({
      projectId,
      clientEmail,
      privateKey,
      privateKeyId,
    });
  }

  return null;
};

const getServiceAccountCredentials = () => {
  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson);
      const normalized = normalizeServiceAccount(parsed);
      if (normalized?.projectId && normalized?.clientEmail && normalized?.privateKey) {
        return normalized;
      }
    } catch (error) {
      // fall through to per-field env handling below
    }
  }

  const fromEnv = buildServiceAccountFromEnv();
  if (fromEnv) {
    return fromEnv;
  }

  throw new Error(
    "Missing Firebase admin credentials. Supply FIREBASE_SERVICE_ACCOUNT_KEY JSON or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
  );
};

const initAdminApp = () => {
  if (!getApps().length) {
    const serviceAccount = getServiceAccountCredentials();
    const credentials = serviceAccount ? cert(serviceAccount) : applicationDefault();

    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      serviceAccount?.projectId;

    if (!projectId) {
      throw new Error(
        "Unable to determine Firebase project ID. Set FIREBASE_PROJECT_ID env var or include project_id in FIREBASE_SERVICE_ACCOUNT_KEY."
      );
    }

    initializeApp({
      credential: credentials,
      projectId,
    });
  }
};

initAdminApp();

export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminFieldValue = FieldValue;
export const adminTimestamp = Timestamp;
