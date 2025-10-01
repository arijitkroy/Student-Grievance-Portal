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
      <p className="text-sm text-slate-500">
        No timeline events yet. Updates will appear here as the grievance progresses.
      </p>
    );
  }

  return (
    <ol className="relative ml-4 border-l border-slate-200">
      {history
        .slice()
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .map((entry, index) => (
          <li key={`${entry.updatedAt}-${index}`} className="mb-8 ml-4">
            <div className="absolute -left-2.5 h-5 w-5 rounded-full border-2 border-indigo-400 bg-white" />
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                {TYPE_LABELS[entry.type] || "Update"}
              </span>
              <span className="text-xs text-slate-400">{formatDateTime(entry.updatedAt)}</span>
            </div>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {entry.type === "status" && entry.status && (
                <div className="mb-3">
                  <GrievanceStatusBadge status={entry.status} />
                </div>
              )}
              {entry.comment && <p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.comment}</p>}
              <p className="mt-3 text-xs text-slate-400">Updated by {entry.updatedBy || "system"}</p>
            </div>
          </li>
        ))}
    </ol>
  );
};

export default GrievanceTimeline;
