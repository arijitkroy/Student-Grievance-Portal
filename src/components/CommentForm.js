import { useState } from "react";

const CommentForm = ({ onSubmit, submitting = false, title = "Add Comment" }) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!comment.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    try {
      await onSubmit(comment.trim());
      setComment("");
    } catch (err) {
      setError(err.message || "Failed to submit comment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <textarea
        rows={4}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Share updates or requests for clarification"
        className="w-full rounded-xl border border-[var(--surface-border)] bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(168,85,247,0.15)] placeholder:text-[#f7e8ff]/40 focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-secondary)]/40"
      />
      {error && <p className="text-xs text-rose-300">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-full bg-[var(--accent-secondary)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0_1.75rem_rgba(168,85,247,0.35)] transition hover:-translate-y-[1px] hover:bg-[#c084fc] disabled:cursor-not-allowed disabled:bg-[#5b328f]"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
