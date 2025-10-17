import { adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { sendNotificationEmail } from "@/lib/mailer";

const loadRecipientContact = async (recipientId) => {
  const doc = await adminDb.collection("users").doc(recipientId).get();
  if (!doc.exists) return null;
  const data = doc.data();
  if (!data?.email) return null;
  return { email: data.email, displayName: data.displayName || null };
};

export const createNotification = async ({
  grievanceId,
  recipientId,
  message,
  emailSubject,
  recipientEmail,
  recipientDisplayName,
}) => {
  if (!recipientId) return null;

  const notificationRef = await adminDb.collection("notifications").add({
    grievanceId: grievanceId || null,
    recipientId,
    message,
    read: false,
    createdAt: adminTimestamp.now(),
  });

  try {
    let email = recipientEmail || null;
    let displayName = recipientDisplayName || null;

    if (!email) {
      const contact = await loadRecipientContact(recipientId);
      if (contact) {
        email = contact.email;
        displayName = contact.displayName;
      }
    }

    if (email) {
      await sendNotificationEmail({
        to: email,
        displayName,
        subject: emailSubject || "Grievance Portal Notification",
        message,
      });
    }
  } catch (error) {
    console.error("Failed to send notification email", error);
  }

  return notificationRef;
};

export const notifyAdmins = async ({ grievanceId, message }) => {
  const admins = await adminDb
    .collection("users")
    .where("role", "==", "admin")
    .get();

  const writes = admins.docs.map((doc) => {
    const data = doc.data();
    return createNotification({
      grievanceId,
      recipientId: doc.id,
      message,
      emailSubject: message,
      recipientEmail: data?.email,
      recipientDisplayName: data?.displayName,
    });
  });

  return Promise.all(writes);
};
