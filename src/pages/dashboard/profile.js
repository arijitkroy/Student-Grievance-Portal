import Head from "next/head";
import Layout from "@/components/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const InfoItem = ({ label, value }) => (
  <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-3 shadow-[0_0_1.5rem_rgba(168,85,247,0.18)]">
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-secondary)]">{label}</p>
    <p className="mt-2 text-sm text-white break-words">{value || "Not provided"}</p>
  </div>
);

const ProfilePage = () => {
  const { user, loading } = useRequireAuth();

  if (loading || !user) {
    return (
      <Layout>
        <div className="mx-auto mt-16 h-48 w-full max-w-3xl rounded-3xl border border-dashed border-[var(--surface-border)] bg-[var(--surface-card)]" />
      </Layout>
    );
  }

  const meta = [
    { label: "Full Name", value: user.displayName },
    { label: "Email", value: user.email },
    { label: "Role", value: user.role },
    { label: "Department", value: user.department },
    { label: "Joined", value: user.createdAt ? new Date(user.createdAt).toLocaleString() : null },
  ];

  const stats = [
    { label: "Grievances Submitted", value: user.totalGrievances ?? "--" },
    { label: "Resolved", value: user.resolvedGrievances ?? "--" },
    { label: "Pending", value: user.pendingGrievances ?? "--" },
  ];

  return (
    <Layout>
      <Head>
        <title>Profile | LastCryy</title>
      </Head>
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="relative overflow-hidden rounded-3xl border border-[var(--surface-border-strong)] bg-gradient-to-br from-[#241032] via-[#140822] to-[#080212] px-6 py-8 shadow-[0_0_3.5rem_rgba(168,85,247,0.25)]">
          <div className="pointer-events-none absolute -left-14 top-6 h-32 w-32 rounded-full bg-[rgba(168,85,247,0.25)] blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-6 h-36 w-36 rounded-full bg-[rgba(255,123,51,0.25)] blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-secondary)]/40 bg-[rgba(168,85,247,0.15)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-secondary)]">
                Profile Overview
              </span>
              <div>
                <h1 className="text-3xl font-semibold text-white drop-shadow-[0_0_1.5rem_rgba(168,85,247,0.45)]">
                  {user.displayName || "Your Profile"}
                </h1>
                <p className="mt-2 text-base text-[var(--text-muted)]">
                  Review your account details and track your grievance activity.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-[var(--accent-secondary)]/40 bg-[rgba(168,85,247,0.12)] px-5 py-4 text-sm text-[var(--text-muted)] shadow-[0_0_2rem_rgba(168,85,247,0.25)]">
              <p className="font-semibold text-white">Account Status</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em]">{user.role || "Member"}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-[0_0_2.5rem_rgba(255,123,51,0.25)]">
              <h2 className="text-lg font-semibold text-white drop-shadow-[0_0_1.25rem_rgba(255,123,51,0.35)]">
                Personal Information
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {meta.map((item) => (
                  <InfoItem key={item.label} {...item} />
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-[0_0_2.5rem_rgba(168,85,247,0.18)]">
              <h2 className="text-lg font-semibold text-white drop-shadow-[0_0_1.25rem_rgba(168,85,247,0.35)]">
                Quick Links
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-[var(--text-muted)]">
                <li>
                  <span className="font-semibold text-white">Need Support?</span>
                  <p className="text-xs text-[var(--text-muted)]/80">
                    Submit a support ticket or mail the grievance cell at lastcryyyyy@gmail.com.
                  </p>
                </li>
                <li>
                  <span className="font-semibold text-white">Security Tips</span>
                  <p className="text-xs text-[var(--text-muted)]/80">
                    Keep your credentials private. Log out if you are using a shared system.
                  </p>
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </Layout>
  );
};

export default ProfilePage;
