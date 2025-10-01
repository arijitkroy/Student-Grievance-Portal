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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
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
          className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {grievance.grievanceNumber}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{grievance.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{grievance.description}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <GrievanceStatusBadge status={grievance.status} />
              <p className="text-xs text-slate-400">
                Updated {formatDate(grievance.updatedAt || grievance.createdAt)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              {grievance.category}
            </span>
            {grievance.anonymous && (
              <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
                Anonymous
              </span>
            )}
            {grievance.assignedTo && (
              <span className="rounded-full bg-indigo-100 px-3 py-1 font-medium text-indigo-600">
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
