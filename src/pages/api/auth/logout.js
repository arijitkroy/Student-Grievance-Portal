import { destroySession } from "@/lib/auth";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  destroySession(res);
  return res.status(200).json({ message: "Logged out" });
}
