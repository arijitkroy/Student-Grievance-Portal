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
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <textarea
        rows={4}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Share updates or requests for clarification"
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
