const STATUS_STYLES = {
  submitted: "bg-slate-100 text-slate-700 border border-slate-200",
  in_review: "bg-blue-100 text-blue-700 border border-blue-200",
  in_progress: "bg-amber-100 text-amber-700 border border-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border border-rose-200",
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
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        STATUS_STYLES[status] || STATUS_STYLES.submitted
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
};

export default GrievanceStatusBadge;
