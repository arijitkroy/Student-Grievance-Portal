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

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");

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

      setGrievances(grievancesRes.grievances || []);
      setStats(statsRes.stats || null);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.status, filters.assignedTo, user]);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [authLoading, loadData, user]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      <Head>
        <title>Dashboard | Grievance Portal</title>
      </Head>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              View grievance activity, track progress, and stay updated on resolutions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <DashboardStats stats={stats} />

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900">Your Grievances</h2>
                  <p className="text-sm text-slate-600">
                    Filter by status or category to narrow down your grievances.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  )}
                </div>
              </div>
              <div className="mt-6">
                {loading ? (
                  <div className="h-32 rounded-xl border border-dashed border-slate-200 bg-slate-50" />
                ) : (
                  <GrievanceList grievances={grievances} />
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <NotificationsPanel
              notifications={notifications}
              onMarkAllRead={markAllRead}
              loading={notificationsLoading}
            />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default DashboardPage;
