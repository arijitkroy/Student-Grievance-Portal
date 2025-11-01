import { optionalAuth } from "@/lib/serverAuth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await optionalAuth(req);
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ message: "Messages array required" });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Perplexity API key not configured" });
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        temperature: 0.3,
        top_p: 0.9,
        messages,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message = errorPayload?.error?.message || "Perplexity request failed";
      return res.status(response.status).json({ message });
    }

    const data = await response.json();
    const completion = data?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ message: completion, raw: data });
  } catch (error) {
    const message = error?.message || "Failed to contact assistant";
    if (!res.headersSent) {
      res.status(500).json({ message });
    }
  }
}
