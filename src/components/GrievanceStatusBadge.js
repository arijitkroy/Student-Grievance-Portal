const STATUS_STYLES = {
  submitted: "border-[var(--accent-secondary)]/40 bg-[rgba(168,85,247,0.18)] text-[var(--accent-secondary)]",
  in_review: "border-[rgba(255,123,51,0.4)] bg-[rgba(255,123,51,0.16)] text-[var(--accent-primary)]",
  in_progress: "border-[rgba(255,193,59,0.35)] bg-[rgba(255,193,59,0.18)] text-amber-200",
  resolved: "border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.16)] text-emerald-200",
  rejected: "border-[rgba(244,63,94,0.4)] bg-[rgba(244,63,94,0.18)] text-rose-200",
};

const STATUS_LABELS = {
  submitted: "Submitted",
  in_review: "In Review",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const GrievanceStatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium shadow-[0_0_1.25rem_rgba(168,85,247,0.25)] ${
        STATUS_STYLES[status] || STATUS_STYLES.submitted
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
};

export default GrievanceStatusBadge;
