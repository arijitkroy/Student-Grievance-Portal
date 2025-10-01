import Head from "next/head";
import Layout from "@/components/Layout";

const sections = [
  {
    title: "Information We Collect",
    items: [
      "Account details such as name, email, and role when you register or are invited by administrators.",
      "Grievance submissions including category, description, attachments, and optional metadata.",
      "Usage logs generated when you access the portal, including timestamps and device information maintained by Firebase.",
    ],
  },
  {
    title: "How We Use Information",
    items: [
      "Facilitating grievance intake, routing, escalation, and resolution workflows.",
      "Notifying stakeholders about updates, assignments, and resolution outcomes.",
      "Improving service reliability and safeguarding the platform against abuse or misuse.",
    ],
  },
  {
    title: "Data Sharing & Retention",
    items: [
      "Grievance data is shared only with authorized institute personnel involved in remediation.",
      "Anonymous submissions are stored without personal identifiers; tracking codes allow follow-up without revealing identity.",
      "Attachments and records are retained in Firebase until administrators archive or delete them in accordance with institute policy.",
    ],
  },
  {
    title: "Your Choices",
    items: [
      "Submit grievances anonymously where permitted and retain the generated tracking code for future reference.",
      "Request updates or deletion of your account by contacting the grievance cell administrators.",
      "Opt out of optional communications by updating notification preferences when available.",
    ],
  },
  {
    title: "Contact",
    items: [
      "For privacy-related questions reach out to the Institute Grievance Cell at privacy@institute.edu.",
    ],
  },
];

const PrivacyPage = () => {
  return (
    <Layout>
      <Head>
        <title>Privacy Policy | Grievance Portal</title>
      </Head>
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Privacy Policy</h1>
          <p className="text-sm text-slate-600">
            This Privacy Policy describes how the Institute Grievance Portal collects, uses, and safeguards
            information submitted by students, staff, and administrators.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <p className="text-xs text-slate-500">
          Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
