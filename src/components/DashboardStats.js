const Card = ({ title, value, subtitle, highlight = false }) => (
  <div
    className={`rounded-2xl border px-5 py-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
      highlight
        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
        : "border-slate-200 bg-white text-slate-700"
    }`}
  >
    <p className="text-sm font-medium uppercase tracking-wide text-slate-400">{title}</p>
    <p className="mt-2 text-3xl font-semibold">{value}</p>
    {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
  </div>
);

const DashboardStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card title="Total Grievances" value={stats.total || 0} subtitle="All time" highlight />
      <Card
        title="Resolved"
        value={stats.resolvedCount || 0}
        subtitle="Marked as resolved"
      />
      <Card
        title="Open"
        value={stats.openCount || 0}
        subtitle="Submitted / In Progress"
      />
      <Card
        title="Avg Resolution Time"
        value={`${stats.avgResolutionTimeHours || 0}h`}
        subtitle="Resolved cases"
      />
    </div>
  );
};

export default DashboardStats;
