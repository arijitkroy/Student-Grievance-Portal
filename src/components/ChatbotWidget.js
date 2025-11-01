import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

const initialSystemPrompt = {
  role: "system",
  content:
    "You are LastCryy Assistant, a helpful AI guide embedded in the grievance portal. Assist users with registration, submitting grievances, tracking statuses, and general support in a concise manner.",
};

const SUGGESTED_TOPICS = [
  "How do I register for the portal?",
  "Steps to submit a grievance",
  "Can I report anonymously?",
  "Understanding grievance statuses",
  "How do admins resolve grievances?",
];

const MessageBubble = ({ role, content }) => (
  <div
    className={clsx("max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow", {
      "ml-auto bg-[rgba(168,85,247,0.2)] text-[#f1deff]": role === "user",
      "mr-auto bg-[rgba(17,5,27,0.85)] text-white border border-[rgba(168,85,247,0.25)]": role !== "user",
    })}
  >
    <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
  </div>
);

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([initialSystemPrompt]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const visibleMessages = messages.filter((message) => message.role !== "system");

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [visibleMessages.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.message || "Assistant request failed");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message || "" }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.message ||
            "I couldn't reach the assistant right now. Please try again later or contact support.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-full border border-[rgba(168,85,247,0.4)] bg-[rgba(168,85,247,0.2)] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_2.5rem_rgba(168,85,247,0.35)] transition hover:-translate-y-1 hover:bg-[rgba(168,85,247,0.3)]"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(168,85,247,0.35)] text-white">
          💬
        </span>
        <span>Assistant</span>
      </button>

      {open && (
        <div className="mt-3 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-3xl border border-[rgba(168,85,247,0.35)] bg-[rgba(8,2,13,0.96)] shadow-[0_0_3.5rem_rgba(168,85,247,0.4)] backdrop-blur">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-white">LastCryy Assistant</h2>
              <p className="text-xs text-[#f1deff]/70">Here to help with registration, submissions, and tracking.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/10 p-1 text-[#f1deff]/80 transition hover:text-white"
            >
              ✕
            </button>
          </header>

          <div ref={containerRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {visibleMessages.length === 0 && (
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-[#f1deff]/70">
                <p className="font-semibold text-white">Suggested prompts</p>
                <ul className="space-y-2">
                  {SUGGESTED_TOPICS.map((topic) => (
                    <li key={topic}>
                      <button
                        type="button"
                        onClick={() => setInput(topic)}
                        className="text-left text-[#cdb5ff] underline-offset-2 hover:underline"
                      >
                        {topic}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {visibleMessages.map((message, index) => (
              <MessageBubble key={`${message.role}-${index}`} role={message.role} content={message.content} />
            ))}

            {loading && (
              <div className="mr-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#f1deff]/70">
                Thinking…
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 bg-[rgba(11,3,18,0.9)] px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask me anything about the portal"
                className="flex-1 rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm text-white placeholder:text-[#f1deff]/40 focus:border-[rgba(168,85,247,0.6)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center rounded-full border border-[rgba(168,85,247,0.5)] bg-[rgba(168,85,247,0.25)] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_1.5rem_rgba(168,85,247,0.35)] transition hover:-translate-y-[1px] hover:bg-[rgba(168,85,247,0.35)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-[#f1deff]/40"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
