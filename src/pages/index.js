import Layout from "@/components/Layout";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const features = [
  {
    title: "Centralized Tracking",
    description: "Submit and monitor grievances across departments with real-time status updates.",
  },
  {
    title: "Role-based Access",
    description: "Students, staff, and administrators collaborate securely within a unified workspace.",
  },
  {
    title: "Analytics & Insights",
    description: "Identify bottlenecks, track resolution timelines, and ensure accountability.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2b0c2f] via-[#16071f] to-[#07020f] px-8 py-16 text-[var(--foreground)] shadow-[0_0_3rem_rgba(255,123,51,0.2)]">
        <div className="pointer-events-none absolute -left-20 top-8 h-40 w-40 rounded-full bg-[rgba(255,123,51,0.2)] blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-48 w-48 rounded-full bg-[rgba(168,85,247,0.25)] blur-3xl" />
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-primary)]/40 bg-[rgba(255,123,51,0.15)] px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-primary)]">
              LastCryy Platform
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_1.5rem_rgba(255,123,51,0.35)] sm:text-5xl">
              Empowering Students and Staff with Transparent Resolution Workflows
            </h1>
            <p className="text-lg text-[#f1deff]/90">
              Submit grievances, collaborate with committees, and track resolutions from submission to closure—all in one secure portal.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/submit"
                className="group inline-flex items-center justify-center rounded-full border border-[var(--accent-primary)] bg-[var(--accent-primary)] px-6 py-3 text-center text-sm font-semibold text-[#1a0b27] shadow-[0_0_1.5rem_rgba(255,123,51,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_2.5rem_rgba(255,123,51,0.6)]"
              >
                Submit a Grievance
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white transition duration-300 hover:-translate-y-1 hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)]"
                >
                  Login to Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_2rem_rgba(168,85,247,0.25)] backdrop-blur">
              <div className="pointer-events-none absolute -top-10 -right-8 h-28 w-28 rotate-12 rounded-full bg-[rgba(168,85,247,0.25)] blur-2xl" />
              <h3 className="text-lg font-semibold text-white">Live Status Timeline</h3>
              <p className="mt-2 text-sm text-[#f1deff]/80">
                Stay informed with automatic notifications at every stage from submission to resolution.
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "Submitted",
                  "In Review",
                  "In Progress",
                  "Resolved",
                ].map((stage, idx) => (
                  <div key={stage} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 transition duration-300 hover:translate-x-2 hover:bg-[rgba(255,123,51,0.2)]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(255,123,51,0.4)] text-sm font-semibold text-white shadow-[0_0_1rem_rgba(255,123,51,0.5)]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{stage}</p>
                      <p className="text-xs text-[#f1deff]/70">
                        Automated reminders ensure timely action.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_2.5rem_rgba(168,85,247,0.25)] transition duration-300 hover:-translate-y-2 hover:border-[var(--accent-primary)]/40 hover:shadow-[0_0_3rem_rgba(255,123,51,0.35)]"
          >
            <div className="pointer-events-none absolute -bottom-16 right-0 h-32 w-32 rounded-full bg-[rgba(255,123,51,0.18)] opacity-0 transition duration-300 group-hover:opacity-100" />
            <h3 className="text-lg font-semibold text-white drop-shadow-[0_0_1rem_rgba(255,123,51,0.3)]">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm text-[#f1deff]/80">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-20 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-[0_0_4rem_rgba(255,123,51,0.25)]">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-[0_0_1.5rem_rgba(255,123,51,0.35)]">
              A collaborative workspace for grievance cells
            </h2>
            <p className="text-base text-[#f1deff]/85">
              Administrators can triage issues, assign them to specialized committees, and escalate when needed. Students and staff enjoy clarity and transparency throughout the resolution lifecycle.
            </p>
            <dl className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition duration-300 hover:border-[var(--accent-primary)]/40 hover:shadow-[0_0_2.5rem_rgba(255,123,51,0.3)]">
                <dt className="text-sm font-semibold text-[var(--accent-primary)]">Anonymous Submissions</dt>
                <dd className="mt-2 text-sm text-[#f1deff]/80">
                  Protect identities while ensuring grievances reach the right teams.
                </dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition duration-300 hover:border-[var(--accent-secondary)]/40 hover:shadow-[0_0_2.5rem_rgba(168,85,247,0.3)]">
                <dt className="text-sm font-semibold text-[var(--accent-secondary)]">Resolution Feedback</dt>
                <dd className="mt-2 text-sm text-[#f1deff]/80">
                  Rate resolutions and add comments to drive service improvements.
                </dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition duration-300 hover:border-[var(--accent-primary)]/40 hover:shadow-[0_0_2.5rem_rgba(255,123,51,0.3)]">
                <dt className="text-sm font-semibold text-[var(--accent-primary)]">Data-backed Insights</dt>
                <dd className="mt-2 text-sm text-[#f1deff]/80">
                  Understand trending categories, SLA adherence, and escalation patterns.
                </dd>
              </div>
            </dl>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-dashed border-[var(--accent-primary)]/40 bg-[rgba(255,123,51,0.12)] p-6 text-[var(--accent-primary)] shadow-[0_0_2.5rem_rgba(255,123,51,0.25)]">
              <h3 className="text-base font-semibold">Need elevated oversight?</h3>
              <p className="mt-2 text-sm text-[#f1deff]/85">
                Enable multi-level escalation workflows to ensure unresolved grievances quickly reach senior authorities.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_2.5rem_rgba(168,85,247,0.25)]">
              <h3 className="text-base font-semibold text-white">
                Ready to streamline grievance handling?
              </h3>
              <p className="mt-3 text-sm text-[#f1deff]/85">
                Create accounts for committee members, configure departmental assignments, and start managing grievances with accountability and empathy.
              </p>
              <Link
                href="/register"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--accent-secondary)] px-5 py-2 text-sm font-semibold text-white shadow-[0_0_2rem_rgba(168,85,247,0.4)] transition duration-300 hover:-translate-y-1 hover:bg-[#c084fc] hover:shadow-[0_0_3rem_rgba(168,85,247,0.45)]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
