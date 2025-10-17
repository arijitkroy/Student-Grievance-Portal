import Link from "next/link";
import GrievanceStatusBadge from "@/components/GrievanceStatusBadge";

const formatDate = (value) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value.toDate?.() || new Date();
  return date.toLocaleString();
};

const GrievanceList = ({ grievances = [], emptyLabel = "No grievances found" }) => {
  if (!grievances.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-[#f1deff]/70 shadow-[0_0_2.5rem_rgba(168,85,247,0.2)]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grievances.map((grievance) => (
        <Link
          href={`/dashboard/grievances/${grievance.id}`}
          key={grievance.id}
          className="group block rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_2.5rem_rgba(168,85,247,0.25)] transition duration-300 hover:-translate-y-2 hover:border-[var(--accent-primary)]/40 hover:shadow-[0_0_3.5rem_rgba(255,123,51,0.35)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#f1deff]/60">
                {grievance.grievanceNumber}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white drop-shadow-[0_0_1rem_rgba(255,123,51,0.3)]">
                {grievance.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-[#f1deff]/75">{grievance.description}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <GrievanceStatusBadge status={grievance.status} />
              <p className="text-xs text-[#f1deff]/60">
                Updated {formatDate(grievance.updatedAt || grievance.createdAt)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#f1deff]/70">
            <span className="rounded-full bg-[rgba(255,123,51,0.18)] px-3 py-1 font-medium text-[var(--accent-primary)] shadow-[0_0_1.25rem_rgba(255,123,51,0.25)]">
              {grievance.category}
            </span>
            {grievance.anonymous && (
              <span className="rounded-full bg-[rgba(255,193,59,0.18)] px-3 py-1 font-medium text-amber-300 shadow-[0_0_1.25rem_rgba(255,193,59,0.3)]">
                Anonymous
              </span>
            )}
            {grievance.assignedTo && (
              <span className="rounded-full bg-[rgba(168,85,247,0.18)] px-3 py-1 font-medium text-[var(--accent-secondary)] shadow-[0_0_1.25rem_rgba(168,85,247,0.3)]">
                Assigned to {grievance.assignedTo}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default GrievanceList;
