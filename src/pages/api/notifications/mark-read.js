import { requireAuth } from "@/lib/serverAuth";
import { adminDb } from "@/lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const user = await requireAuth(req, res, { allowAnonymousUser: false });

    const batch = adminDb.batch();
    const snapshot = await adminDb
      .collection("notifications")
      .where("recipientId", "==", user.id)
      .where("read", "==", false)
      .limit(50)
      .get();

    snapshot.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();

    return res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    if (!res.headersSent) {
      const statusCode = error.message === "UNAUTHENTICATED" ? 401 : 500;
      res.status(statusCode).json({ message: error.message || "Failed to update notifications" });
    }
  }
}
