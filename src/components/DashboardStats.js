const Card = ({ title, value, subtitle, highlight = false }) => (
  <div
    className={`rounded-2xl border px-5 py-6 shadow-[0_0_2.5rem_rgba(168,85,247,0.2)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_3.5rem_rgba(255,123,51,0.3)] ${
      highlight
        ? "border-[var(--accent-primary)]/40 bg-[rgba(255,123,51,0.14)] text-[var(--accent-primary)]"
        : "border-white/10 bg-white/5 text-[#f1deff]"
    }`}
  >
    <p className="text-sm font-medium uppercase tracking-wide text-[#f1deff]/60">{title}</p>
    <p className="mt-2 text-3xl font-semibold">{value}</p>
    {subtitle && <p className="mt-2 text-sm text-[#f1deff]/70">{subtitle}</p>}
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
