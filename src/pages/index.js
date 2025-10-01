import Layout from "@/components/Layout";
import Link from "next/link";

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
  return (
    <Layout>
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-16 text-white shadow-lg">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-semibold uppercase tracking-wide">
              Institute Grievance Portal
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Empowering Students and Staff with Transparent Resolution Workflows
            </h1>
            <p className="text-lg text-indigo-100">
              Submit grievances, collaborate with committees, and track resolutions from submission to closure—all in one secure portal.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/submit"
                className="rounded-md bg-white px-6 py-3 text-center text-sm font-semibold text-indigo-600 shadow-lg shadow-indigo-800/30 transition hover:bg-indigo-50"
              >
                Submit a Grievance
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-white/60 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Login to Dashboard
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-xl bg-white/15 p-6 backdrop-blur-lg">
              <h3 className="text-lg font-semibold text-white">Live Status Timeline</h3>
              <p className="mt-2 text-sm text-indigo-100">
                Stay informed with automatic notifications at every stage from submission to resolution.
              </p>
              <div className="mt-4 space-y-3">
                {["Submitted", "In Review", "In Progress", "Resolved"].map((stage, idx) => (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{stage}</p>
                      <p className="text-xs text-indigo-100">Automated reminders ensure timely action.</p>
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
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-3 text-sm text-slate-600">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-20 rounded-3xl bg-white p-10 shadow-xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">A collaborative workspace for grievance cells</h2>
            <p className="mt-4 text-base text-slate-600">
              Administrators can triage issues, assign them to specialized committees, and escalate when needed. Students and staff enjoy clarity and transparency throughout the resolution lifecycle.
            </p>
            <dl className="mt-6 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <dt className="text-sm font-semibold text-indigo-600">Anonymous Submissions</dt>
                <dd className="mt-2 text-sm text-slate-600">Protect identities while ensuring grievances reach the right teams.</dd>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <dt className="text-sm font-semibold text-indigo-600">Resolution Feedback</dt>
                <dd className="mt-2 text-sm text-slate-600">Rate resolutions and add comments to drive service improvements.</dd>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <dt className="text-sm font-semibold text-indigo-600">Data-backed Insights</dt>
                <dd className="mt-2 text-sm text-slate-600">Understand trending categories, SLA adherence, and escalation patterns.</dd>
              </div>
            </dl>
          </div>
          <div className="space-y-6">
            <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-6 text-indigo-700">
              <h3 className="text-base font-semibold">Need elevated oversight?</h3>
              <p className="mt-2 text-sm">
                Enable multi-level escalation workflows to ensure unresolved grievances quickly reach senior authorities.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Ready to streamline grievance handling?</h3>
              <p className="mt-3 text-sm text-slate-600">
                Create accounts for committee members, configure departmental assignments, and start managing grievances with accountability and empathy.
              </p>
              <Link
                href="/register"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
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
