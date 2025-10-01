import { requireAuth } from "@/lib/serverAuth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const user = await requireAuth(req, res, { allowAnonymousUser: true });
    return res.status(200).json({ user });
  } catch (error) {
    if (error.message === "UNAUTHENTICATED") {
      return res.status(401).json({ message: "Unauthenticated" });
    }
    console.error("Me endpoint error", error);
    return res.status(500).json({ message: "Failed to load user" });
  }
}
