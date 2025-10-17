import GrievanceStatusBadge from "@/components/GrievanceStatusBadge";

const formatDateTime = (value) => {
  if (!value) return "";
  if (typeof value === "string") return new Date(value).toLocaleString();
  if (value?._seconds) return new Date(value._seconds * 1000).toLocaleString();
  return "";
};

const TYPE_LABELS = {
  status: "Status Update",
  comment: "Comment",
  assignment: "Assignment",
  escalation: "Escalation",
  feedback: "Feedback",
};

const GrievanceTimeline = ({ history = [] }) => {
  if (!history.length) {
    return (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      <p className="text-sm text-[#f1deff]/70">
=======
      <p className="text-sm text-[var(--text-muted)]">
>>>>>>> Stashed changes
=======
      <p className="text-sm text-[var(--text-muted)]">
>>>>>>> Stashed changes
=======
      <p className="text-sm text-[var(--text-muted)]">
>>>>>>> Stashed changes
        No timeline events yet. Updates will appear here as the grievance progresses.
      </p>
    );
  }

  return (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    <ol className="relative ml-4 border-l border-[rgba(163,255,109,0.35)]">
=======
    <ol className="relative ml-4 border-l border-[var(--surface-border)]">
>>>>>>> Stashed changes
=======
    <ol className="relative ml-4 border-l border-[var(--surface-border)]">
>>>>>>> Stashed changes
=======
    <ol className="relative ml-4 border-l border-[var(--surface-border)]">
>>>>>>> Stashed changes
      {history
        .slice()
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .map((entry, index) => (
          <li key={`${entry.updatedAt}-${index}`} className="mb-8 ml-4">
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
            <div className="absolute -left-2.5 h-5 w-5 rounded-full border-2 border-[rgba(255,123,51,0.8)] bg-[#12051b] shadow-[0_0_1rem_rgba(255,123,51,0.35)]" />
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-primary)]">
                {TYPE_LABELS[entry.type] || "Update"}
              </span>
              <span className="text-xs text-[#f1deff]/60">{formatDateTime(entry.updatedAt)}</span>
            </div>
            <div className="mt-2 rounded-2xl border border-[rgba(163,255,109,0.35)] bg-[rgba(12,3,20,0.85)] p-4 shadow-[0_0_2rem_rgba(163,255,109,0.18)] backdrop-blur">
=======
            <div className="absolute -left-2.5 h-5 w-5 rounded-full border-2 border-[var(--accent-secondary)] bg-[#11051b] shadow-[0_0_0.75rem_rgba(168,85,247,0.5)]" />
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-secondary)]">
                {TYPE_LABELS[entry.type] || "Update"}
              </span>
              <span className="text-xs text-[var(--text-muted)]">{formatDateTime(entry.updatedAt)}</span>
            </div>
            <div className="mt-2 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 shadow-[0_0_1.8rem_rgba(168,85,247,0.18)]">
>>>>>>> Stashed changes
=======
            <div className="absolute -left-2.5 h-5 w-5 rounded-full border-2 border-[var(--accent-secondary)] bg-[#11051b] shadow-[0_0_0.75rem_rgba(168,85,247,0.5)]" />
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-secondary)]">
                {TYPE_LABELS[entry.type] || "Update"}
              </span>
              <span className="text-xs text-[var(--text-muted)]">{formatDateTime(entry.updatedAt)}</span>
            </div>
            <div className="mt-2 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 shadow-[0_0_1.8rem_rgba(168,85,247,0.18)]">
>>>>>>> Stashed changes
=======
            <div className="absolute -left-2.5 h-5 w-5 rounded-full border-2 border-[var(--accent-secondary)] bg-[#11051b] shadow-[0_0_0.75rem_rgba(168,85,247,0.5)]" />
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-secondary)]">
                {TYPE_LABELS[entry.type] || "Update"}
              </span>
              <span className="text-xs text-[var(--text-muted)]">{formatDateTime(entry.updatedAt)}</span>
            </div>
            <div className="mt-2 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 shadow-[0_0_1.8rem_rgba(168,85,247,0.18)]">
>>>>>>> Stashed changes
              {entry.type === "status" && entry.status && (
                <div className="mb-3">
                  <GrievanceStatusBadge status={entry.status} />
                </div>
              )}
              {entry.comment && (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                <p className="text-sm text-[#f1deff]/85 whitespace-pre-wrap">{entry.comment}</p>
              )}
              <p className="mt-3 text-xs text-[#f1deff]/60">Updated by {entry.updatedBy || "system"}</p>
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{entry.comment}</p>
              )}
              <p className="mt-3 text-xs text-[var(--text-muted)]/80">
                Updated by {entry.updatedBy || "system"}
              </p>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            </div>
          </li>
        ))}
    </ol>
  );
};

export default GrievanceTimeline;
