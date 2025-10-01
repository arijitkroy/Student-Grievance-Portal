import Head from "next/head";
import Layout from "@/components/Layout";

const sections = [
  {
    title: "Acceptance of Terms",
    body: "By accessing or using the Institute Grievance Portal you agree to comply with these Terms of Use and all applicable institute policies. If you do not agree, do not use the service.",
  },
  {
    title: "Account Responsibilities",
    body: "You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify administrators immediately if you suspect unauthorized access.",
  },
  {
    title: "Appropriate Use",
    body: "Submit grievances that are accurate, respectful, and relevant to institute affairs. Do not upload unlawful content or material that infringes on intellectual property or privacy rights.",
  },
  {
    title: "Administrative Actions",
    body: "Institute administrators may modify, archive, or remove grievances that violate policy, and may suspend access for abuse or security concerns. Notifications of such actions will be communicated when possible.",
  },
  {
    title: "Service Availability",
    body: "While the institute strives for continuous availability, the portal may experience scheduled maintenance or unexpected downtime. Critical issues can be escalated via alternate channels provided by the grievance cell.",
  },
  {
    title: "Changes to Terms",
    body: "The institute may update these Terms periodically. Continued use of the portal after changes take effect constitutes acceptance of the revised Terms.",
  },
  {
    title: "Contact",
    body: "For questions about these Terms contact the Institute Grievance Cell at legal@institute.edu.",
  },
];

const TermsPage = () => {
  return (
    <Layout>
      <Head>
        <title>Terms of Use | Grievance Portal</title>
      </Head>
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Terms of Use</h1>
          <p className="text-sm text-slate-600">
            These Terms govern access to and use of the Institute Grievance Portal by students, staff, and
            administrators.
          </p>
        </header>

        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {sections.map((section) => (
            <article key={section.title} className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <p className="text-sm text-slate-600">{section.body}</p>
            </article>
          ))}
        </section>

        <p className="text-xs text-slate-500">
          Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </Layout>
  );
};

export default TermsPage;
