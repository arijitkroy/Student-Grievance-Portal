import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import GrievanceStatusBadge from "@/components/GrievanceStatusBadge";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiFetch } from "@/lib/apiClient";

const formatDateTime = (value) => {
  if (!value) return "--";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date?.valueOf?.())) return "--";
  return date.toLocaleString();
};

const formatHours = (hours) => {
  if (hours === null || hours === undefined) return "--";
  if (hours < 24) {
    return `${hours.toFixed(2)} h`;
  }
  const days = hours / 24;
  return `${days.toFixed(2)} d`;
};

const percentile = (values, p) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  const weight = idx - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

const AnalyticsPage = () => {
  const { user, loading: authLoading } = useRequireAuth({ roles: ["admin"] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);

  const loadAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch("/api/grievances/analytics");
      setRecords(response.analytics || []);
    } catch (err) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;
    loadAnalytics();
  }, [authLoading, user, loadAnalytics]);

  const metrics = useMemo(() => {
    if (!records.length) {
      return {
        total: 0,
        closedCount: 0,
        averageResolution: null,
        medianResolution: null,
        percentile90: null,
        fastest: null,
        slowest: null,
      };
    }

    const closed = records.filter((item) => item.resolutionHours !== null);
    const closedDurations = closed.map((item) => Number(item.resolutionHours));
    const total = records.length;
    const closedCount = closed.length;

    if (!closedDurations.length) {
      return {
        total,
        closedCount,
        averageResolution: null,
        medianResolution: null,
        percentile90: null,
        fastest: null,
        slowest: null,
      };
    }

    const sum = closedDurations.reduce((acc, value) => acc + value, 0);
    const averageResolution = sum / closedDurations.length;
    const medianResolution = percentile(closedDurations, 50);
    const percentile90 = percentile(closedDurations, 90);

    const sorted = [...closed].sort((a, b) => a.resolutionHours - b.resolutionHours);
    const fastest = sorted[0];
    const slowest = sorted[sorted.length - 1];

    return {
      total,
      closedCount,
      averageResolution,
      medianResolution,
      percentile90,
      fastest,
      slowest,
    };
  }, [records]);

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="mx-auto mt-16 h-48 w-full max-w-4xl rounded-3xl border border-dashed border-[var(--surface-border)] bg-[var(--surface-card)]" />
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Analytics | LastCryy</title>
      </Head>
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="relative overflow-hidden rounded-3xl border border-[var(--surface-border-strong)] bg-gradient-to-br from-[#1d0b2a] via-[#11051b] to-[#06010f] px-6 py-8 shadow-[0_0_3.5rem_rgba(168,85,247,0.25)]">
          <div className="pointer-events-none absolute -left-16 top-10 h-32 w-32 rounded-full bg-[rgba(168,85,247,0.25)] blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-10 h-36 w-36 rounded-full bg-[rgba(255,123,51,0.25)] blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-secondary)]/40 bg-[rgba(168,85,247,0.18)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-secondary)]">
                Analytics Overview
              </span>
              <div>
                <h1 className="text-3xl font-semibold text-white drop-shadow-[0_0_1.5rem_rgba(168,85,247,0.45)]">
                  Grievance Resolution Insights
                </h1>
                <p className="mt-2 text-sm text-[#f1deff]/80">
                  Track how long grievances take to reach closure and identify outliers.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadAnalytics}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-secondary)] bg-[var(--accent-secondary)] px-4 py-2 text-sm font-semibold text-[#1a0b27] shadow-[0_0_2.5rem_rgba(168,85,247,0.35)] transition hover:-translate-y-1 hover:bg-[#c084fc] disabled:cursor-not-allowed disabled:border-[#5b328f] disabled:bg-[#5b328f] disabled:text-[#1f0a28]"
            >
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-rose-400/40 bg-[rgba(244,63,94,0.12)] px-4 py-3 text-sm text-rose-200 shadow-[0_0_2rem_rgba(244,63,94,0.25)]">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[rgba(168,85,247,0.35)] bg-[rgba(168,85,247,0.12)] p-5 shadow-[0_0_2.5rem_rgba(168,85,247,0.25)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-secondary)]">
              Total tracked grievances
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{metrics.total}</p>
            <p className="mt-1 text-xs text-[#f1deff]/70">Including active and closed cases.</p>
          </div>
          <div className="rounded-3xl border border-[rgba(126,255,95,0.4)] bg-[rgba(126,255,95,0.12)] p-5 shadow-[0_0_2.5rem_rgba(126,255,95,0.25)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b5ff9b]">
              Closed grievances
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{metrics.closedCount}</p>
            <p className="mt-1 text-xs text-[#f1deff]/70">Grievances resolved or rejected.</p>
          </div>
          <div className="rounded-3xl border border-[rgba(253,224,71,0.35)] bg-[rgba(253,224,71,0.12)] p-5 shadow-[0_0_2.5rem_rgba(253,224,71,0.25)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#fde68a]">
              Avg. resolution time
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatHours(metrics.averageResolution)}</p>
            <p className="mt-1 text-xs text-[#f1deff]/70">Across all closed grievances.</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[rgba(255,123,51,0.35)] bg-[rgba(255,123,51,0.12)] p-5 shadow-[0_0_2.5rem_rgba(255,123,51,0.25)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary)]">
              Median resolution
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatHours(metrics.medianResolution)}</p>
            <p className="mt-1 text-xs text-[#f1deff]/70">Half of closed grievances resolved by this time.</p>
          </div>
          <div className="rounded-3xl border border-[rgba(59,130,246,0.35)] bg-[rgba(59,130,246,0.12)] p-5 shadow-[0_0_2.5rem_rgba(59,130,246,0.25)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#93c5fd]">
              90th percentile
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatHours(metrics.percentile90)}</p>
            <p className="mt-1 text-xs text-[#f1deff]/70">Only 10% of closed grievances took longer.</p>
          </div>
          <div className="rounded-3xl border border-[rgba(96,165,250,0.35)] bg-[rgba(96,165,250,0.12)] p-5 shadow-[0_0_2.5rem_rgba(96,165,250,0.25)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#bfdbfe]">
              Fastest vs slowest
            </p>
            <div className="mt-2 space-y-2 text-sm text-[#f1deff]/80">
              <p>
                <span className="font-semibold text-white">Fastest:</span> {formatHours(metrics.fastest?.resolutionHours)}
                {metrics.fastest ? ` • ${metrics.fastest.grievanceNumber}` : ""}
              </p>
              <p>
                <span className="font-semibold text-white">Slowest:</span> {formatHours(metrics.slowest?.resolutionHours)}
                {metrics.slowest ? ` • ${metrics.slowest.grievanceNumber}` : ""}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[rgba(168,85,247,0.35)] bg-[#11051b] shadow-[0_0_2.5rem_rgba(168,85,247,0.2)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5 text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.2em] text-[#f1deff]/70">
                <tr>
                  <th className="px-4 py-3">Grievance</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Closed</th>
                  <th className="px-4 py-3">Resolution</th>
                  <th className="px-4 py-3">Elapsed (current)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#f1deff]/85">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-[#f1deff]/70">
                      Loading analytics…
                    </td>
                  </tr>
                ) : records.length ? (
                  records.map((record) => (
                    <tr key={record.id} className="transition hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#f1deff]/60">
                            {record.grievanceNumber || record.id}
                          </p>
                          <p className="font-semibold text-white">{record.title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{record.category}</td>
                      <td className="px-4 py-3">
                        <GrievanceStatusBadge status={record.status} />
                      </td>
                      <td className="px-4 py-3">{record.assignedTo || "--"}</td>
                      <td className="px-4 py-3">{formatDateTime(record.createdAt)}</td>
                      <td className="px-4 py-3">{formatDateTime(record.closedAt)}</td>
                      <td className="px-4 py-3">{formatHours(record.resolutionHours)}</td>
                      <td className="px-4 py-3">{formatHours(record.currentDurationHours)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-[#f1deff]/70">
                      No grievances found for analytics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
