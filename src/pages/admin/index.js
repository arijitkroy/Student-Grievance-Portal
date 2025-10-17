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
        <header className="relative overflow-hidden rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)] px-6 py-7 shadow-[0_0_3rem_rgba(168,85,247,0.25)]">
          <div className="pointer-events-none absolute -left-16 top-8 h-32 w-32 rounded-full bg-[rgba(255,123,51,0.18)] blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-6 h-36 w-36 rounded-full bg-[rgba(168,85,247,0.2)] blur-3xl" />
          <div className="relative space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-primary)]/40 bg-[rgba(255,123,51,0.15)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-primary)]">
              Admin Console
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-white drop-shadow-[0_0_1.5rem_rgba(255,123,51,0.35)]">
                Administrator Console
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Monitor grievance activity, coordinate assignments, and track institutional response metrics.
              </p>
            </div>
            <button
              type="button"
              onClick={loadStats}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-secondary)]/40 bg-[rgba(168,85,247,0.18)] px-4 py-2 text-xs font-medium text-[var(--accent-secondary)] shadow-[0_0_1.75rem_rgba(168,85,247,0.35)] transition hover:-translate-y-1 hover:bg-[rgba(168,85,247,0.28)]"
              disabled={loading}
            >
              Refresh insights
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-rose-400/40 bg-[rgba(244,63,94,0.12)] px-4 py-3 text-sm text-rose-200 shadow-[0_0_2rem_rgba(244,63,94,0.25)]">
            {error}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-3 h-40 rounded-2xl border border-dashed border-[var(--surface-border)] bg-[rgba(255,255,255,0.04)]" />
          ) : (
            <>
              <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-[0_0_2.2rem_rgba(255,123,51,0.18)]">
                <h2 className="text-sm font-semibold text-[var(--text-muted)]">Open grievances</h2>
                <p className="mt-2 text-3xl font-semibold text-white">{stats?.openCount ?? 0}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Includes submitted, in review, and in progress cases.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-[0_0_2.2rem_rgba(56,189,248,0.2)]">
                <h2 className="text-sm font-semibold text-[var(--text-muted)]">Resolved this month</h2>
                <p className="mt-2 text-3xl font-semibold text-emerald-300">{stats?.resolvedThisMonth ?? 0}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Automatically calculated from resolution timestamps.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-[0_0_2.2rem_rgba(168,85,247,0.25)]">
                <h2 className="text-sm font-semibold text-[var(--text-muted)]">Average resolution time</h2>
                <p className="mt-2 text-3xl font-semibold text-[var(--accent-secondary)]">
                  {stats?.avgResolutionTimeHours ? `${Math.round(stats.avgResolutionTimeHours)} hrs` : "—"}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Based on closed grievances with feedback.</p>
              </div>
            </>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-6 shadow-[0_0_2.2rem_rgba(255,123,51,0.2)]">
            <h2 className="text-lg font-semibold text-white">Operational Checklist</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--text-muted)]">
              <li>Review newly submitted grievances and assign them to the correct department.</li>
              <li>Escalate cases that have exceeded response SLAs or require senior attention.</li>
              <li>Ensure resolution notes are recorded and notifications are sent to stakeholders.</li>
            </ul>
          </div>
          <div className="space-y-4 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-6 shadow-[0_0_2.2rem_rgba(168,85,247,0.25)]">
            <h2 className="text-lg font-semibold text-white">Quick Links</h2>
            <ul className="space-y-2 text-sm text-[var(--accent-secondary)]">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition hover:text-white/90 hover:underline">
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
