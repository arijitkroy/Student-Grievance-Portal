import { useState } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import GrievanceForm from "@/components/GrievanceForm";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiFetch } from "@/lib/apiClient";

const SubmitGrievancePage = () => {
  const { user } = useRequireAuth();
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async ({ form, files }) => {
    if (!user && !form.anonymous) {
      setError("You must be logged in to submit non-anonymous grievances.");
      return { error: "Authentication required" };
    }

    setSubmitting(true);
    setSuccessMessage("");
    setTrackingCode("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("category", form.category);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("anonymous", form.anonymous ? "true" : "false");
      if (form.assignedTo) {
        formData.append("assignedTo", form.assignedTo);
      }
      if (form.initialComment) {
        formData.append("initialComment", form.initialComment);
      }

      files.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch("/api/grievances", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to submit grievance");
      }

      setSuccessMessage("Grievance submitted successfully.");
      if (payload.trackingCode) {
        setTrackingCode(payload.trackingCode);
      }

      return { reset: true };
    } catch (err) {
      setError(err.message || "Failed to submit grievance");
      return { error: err.message };
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Submit Grievance | LastCryy</title>
      </Head>
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_3rem_rgba(255,123,51,0.2)] backdrop-blur">
          <h1 className="text-3xl font-semibold text-white drop-shadow-[0_0_1.5rem_rgba(255,123,51,0.35)]">
            Submit a Grievance
          </h1>
          <p className="text-sm text-[#f1deff]/80">
            Share your concern with the institute grievance cell. Provide as much detail as possible to
            help us resolve your issue quickly.
          </p>
        </header>

        {successMessage && (
          <div className="rounded-xl border border-emerald-400/40 bg-[rgba(34,197,94,0.12)] px-4 py-3 text-sm text-emerald-100 shadow-[0_0_2rem_rgba(34,197,94,0.25)]">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-400/40 bg-[rgba(244,63,94,0.12)] px-4 py-3 text-sm text-rose-200 shadow-[0_0_2rem_rgba(244,63,94,0.25)]">
            {error}
          </div>
        )}
        {trackingCode && (
          <div className="rounded-2xl border border-[var(--accent-secondary)]/40 bg-[rgba(168,85,247,0.18)] px-5 py-4 text-sm text-[var(--accent-secondary)] shadow-[0_0_2rem_rgba(168,85,247,0.3)]">
            <p className="font-semibold">Anonymous tracking code</p>
            <p className="mt-1 text-base font-mono text-white">{trackingCode}</p>
            <p className="mt-2 text-xs text-[#f1deff]/80">
              Save this code to check your grievance status later.
            </p>
          </div>
        )}

        <GrievanceForm
          onSubmit={handleSubmit}
          submitting={submitting}
          allowAnonymous
          showAssignmentField={user?.role === "admin"}
          showInitialComment
        />

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_2.5rem_rgba(168,85,247,0.2)] backdrop-blur">
          <h2 className="text-lg font-semibold text-white drop-shadow-[0_0_1.25rem_rgba(255,123,51,0.3)]">
            Submission guidelines
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-[#f1deff]/80">
            <li>Provide a clear and concise title summarizing the issue.</li>
            <li>Include relevant dates, locations, and parties involved in the description.</li>
            <li>Upload supporting documents such as images, letters, or receipts if applicable.</li>
            <li>
              For sensitive matters, enable anonymous submission. You&apos;ll receive a tracking code for
              future reference.
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  );
};

export default SubmitGrievancePage;
