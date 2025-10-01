import { adminDb, adminTimestamp } from "@/lib/firebaseAdmin";

export const createNotification = async ({ grievanceId, recipientId, message }) => {
  if (!recipientId) return null;

  return adminDb.collection("notifications").add({
    grievanceId: grievanceId || null,
    recipientId,
    message,
    read: false,
    createdAt: adminTimestamp.now(),
  });
};

export const notifyAdmins = async ({ grievanceId, message }) => {
  const admins = await adminDb
    .collection("users")
    .where("role", "==", "admin")
    .get();

  const writes = admins.docs.map((doc) =>
    createNotification({
      grievanceId,
      recipientId: doc.id,
      message,
    })
  );

  return Promise.all(writes);
};
