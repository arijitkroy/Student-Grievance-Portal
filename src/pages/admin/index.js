import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiFetch } from "@/lib/apiClient";

const quickLinks = [
  { href: "/dashboard", label: "Student Dashboard" },
  { href: "/dashboard/submit", label: "Submit on behalf of user" },
  { href: "/", label: "Public Landing" },
];

const AdminPage = () => {
  const { user, loading: authLoading } = useRequireAuth({ roles: ["admin"] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch("/api/grievances/stats");
      setStats(response.stats || null);
    } catch (err) {
      setError(err.message || "Failed to load admin insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadStats();
    }
  }, [authLoading, loadStats, user]);

  return (
    <Layout>
      <Head>
        <title>Admin Console | Grievance Portal</title>
      </Head>
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Administrator Console</h1>
          <p className="text-sm text-slate-600">
            Monitor grievance activity, coordinate assignments, and track institutional response metrics.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-3 h-40 rounded-2xl border border-dashed border-slate-200 bg-slate-50" />
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-500">Open grievances</h2>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {stats?.openCount ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-500">Includes submitted, in review, and in progress cases.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-500">Resolved this month</h2>
                <p className="mt-2 text-3xl font-semibold text-emerald-600">
                  {stats?.resolvedThisMonth ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-500">Automatically calculated from resolution timestamps.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-500">Average resolution time</h2>
                <p className="mt-2 text-3xl font-semibold text-indigo-600">
                  {stats?.avgResolutionTimeHours
                    ? `${Math.round(stats.avgResolutionTimeHours)} hrs`
                    : "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">Based on closed grievances with feedback.</p>
              </div>
            </>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Operational Checklist</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Review newly submitted grievances and assign them to the correct department.</li>
              <li>Escalate cases that have exceeded response SLAs or require senior attention.</li>
              <li>Ensure resolution notes are recorded and notifications are sent to stakeholders.</li>
            </ul>
          </div>
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick Links</h2>
            <ul className="space-y-2 text-sm text-indigo-600">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AdminPage;
