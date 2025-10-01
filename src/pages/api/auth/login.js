import { createSessionCookie, setSession } from "@/lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { idToken } = req.body || {};

    if (!idToken) {
      return res.status(400).json({ message: "Missing idToken" });
    }

    const sessionCookie = await createSessionCookie(idToken);
    setSession(res, sessionCookie);

    return res.status(200).json({ message: "Session created" });
  } catch (error) {
    console.error("Login error", error);
    return res.status(400).json({ message: error.message || "Failed to login" });
  }
}
