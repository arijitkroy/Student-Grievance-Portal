import { requireAuth } from "@/lib/serverAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { serializeCollection } from "@/lib/serializers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const user = await requireAuth(req, res, { allowAnonymousUser: false });

    const snapshot = await adminDb
      .collection("notifications")
      .where("recipientId", "==", user.id)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const notifications = serializeCollection(snapshot);

    return res.status(200).json({ notifications });
  } catch (error) {
    if (!res.headersSent) {
      const statusCode = error.message === "UNAUTHENTICATED" ? 401 : 500;
      res.status(statusCode).json({ message: error.message || "Failed to load notifications" });
    }
  }
}
