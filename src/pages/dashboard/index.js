import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import DashboardStats from "@/components/DashboardStats";
import GrievanceList from "@/components/GrievanceList";
import NotificationsPanel from "@/components/NotificationsPanel";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { apiFetch, buildQueryString } from "@/lib/apiClient";
import { GRIEVANCE_CATEGORIES, GRIEVANCE_STATUSES } from "@/lib/models";

const DashboardPage = () => {
  const { user, loading: authLoading } = useRequireAuth();
  const { notifications, loading: notificationsLoading, markAllRead } = useNotifications();

  const [filters, setFilters] = useState({ status: "", category: "", assignedTo: "" });
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filterOptions = useMemo(
    () => ({
      statuses: [{ value: "", label: "All statuses" }, ...GRIEVANCE_STATUSES.map((status) => ({
        value: status,
        label: status.replace(/_/g, " "),
      }))],
      categories: [
        { value: "", label: "All categories" },
        ...GRIEVANCE_CATEGORIES.map((category) => ({ value: category, label: category })),
      ],
    }),
    []
  );

  const loadData = useCallback(
    async ({ guard } = {}) => {
      if (!user) return;

      const isActive = () => !guard || guard.current;

      if (isActive()) {
        setLoading(true);
        setError("");
      }

      try {
        const query = buildQueryString({
          status: filters.status,
          category: filters.category,
          assignedTo: filters.assignedTo || undefined,
        });

        const [grievancesRes, statsRes] = await Promise.all([
          apiFetch(`/api/grievances${query}`),
          apiFetch(`/api/grievances/stats`),
        ]);

        if (!isActive()) return;

        setGrievances(grievancesRes.grievances || []);
        setStats(statsRes.stats || null);
      } catch (err) {
        if (!isActive()) return;
        setError(err.message || "Failed to load dashboard data");
      } finally {
        if (!isActive()) return;
        setLoading(false);
      }
    },
    [filters.assignedTo, filters.category, filters.status, user]
  );

  useEffect(() => {
    if (authLoading || !user) return;

    const guard = { current: true };
    loadData({ guard });

    return () => {
      guard.current = false;
    };
  }, [authLoading, user, loadData]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      <Head>
        <title>Dashboard | LastCryy</title>
      </Head>
      <div className="flex flex-col gap-8">
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#2b0c2f] via-[#16071f] to-[#07020f] px-6 py-7 shadow-[0_0_3.5rem_rgba(255,123,51,0.25)]">
          <div className="pointer-events-none absolute -left-14 top-6 h-32 w-32 rounded-full bg-[rgba(255,123,51,0.22)] blur-3xl" />
          <div className="pointer-events-none absolute -right-12 bottom-6 h-36 w-36 rounded-full bg-[rgba(168,85,247,0.22)] blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-primary)]/40 bg-[rgba(255,123,51,0.15)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-primary)]">
                Dashboard Hub
              </span>
              <div>
                <h1 className="text-3xl font-semibold text-white drop-shadow-[0_0_1.5rem_rgba(255,123,51,0.35)]">
                  Dashboard
                </h1>
                <p className="mt-2 text-base text-[#f1deff]/85">
                  View grievance activity, track progress, and stay updated on resolutions.
                </p>
              </div>
              <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(255,123,51,0.35)] bg-[rgba(255,123,51,0.12)] px-4 py-2 text-xs font-medium text-[var(--accent-primary)] shadow-[0_0_1.5rem_rgba(255,123,51,0.35)]">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
                Real-time stats auto-refresh every 5 minutes
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadData}
                className="rounded-full border border-[var(--accent-primary)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-[#1a0b27] shadow-[0_0_2rem_rgba(255,123,51,0.35)] transition hover:-translate-y-1 hover:bg-[#ff965f] disabled:cursor-not-allowed disabled:border-[#6c3924] disabled:bg-[#6c3924] disabled:text-[#2e0f1f]"
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-rose-400/40 bg-[rgba(244,63,94,0.1)] px-4 py-3 text-sm text-rose-200 shadow-[0_0_2rem_rgba(244,63,94,0.25)]">
            {error}
          </div>
        )}

        <DashboardStats stats={stats} />

        <section className="grid gap-6">
          <div className="space-y-6">
            <div className="rounded-3xl border border-[rgba(253,224,71,0.4)] bg-white/5 p-5 shadow-[0_0_2.5rem_rgba(253,224,71,0.3)] backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-white drop-shadow-[0_0_1.25rem_rgba(255,123,51,0.3)]">
                    Your Grievances
                  </h2>
                  <p className="text-sm text-[#f1deff]/75">
                    Filter by status or category to narrow down your grievances.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="rounded-xl border border-white/10 bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(168,85,247,0.15)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
                  >
                    {filterOptions.statuses.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="rounded-xl border border-white/10 bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(168,85,247,0.15)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
                  >
                    {filterOptions.categories.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {user?.role === "admin" && (
                    <input
                      type="text"
                      name="assignedTo"
                      value={filters.assignedTo}
                      onChange={handleFilterChange}
                      placeholder="Assigned to"
                      className="rounded-xl border border-white/10 bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(168,85,247,0.15)] placeholder:text-[#f7e8ff]/40 focus:border-[var(--accent-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-secondary)]/40"
                    />
                  )}
                </div>
              </div>
              <div className="mt-6">
                {loading ? (
                  <div className="h-32 rounded-xl border border-dashed border-white/15 bg-white/5" />
                ) : (
                  <GrievanceList grievances={grievances} />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default DashboardPage;
