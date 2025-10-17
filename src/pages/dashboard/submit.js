import { useEffect, useState } from "react";
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  useEffect(() => {
    if (successMessage) {
      setShowSuccessModal(true);
    }
  }, [successMessage]);

  return (
    <Layout>
      <Head>
        <title>Submit Grievance | LastCryy</title>
      </Head>
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#2b0c2f] via-[#16071f] to-[#07020f] p-8 shadow-[0_0_3.5rem_rgba(255,123,51,0.25)]">
          <div className="pointer-events-none absolute -left-16 top-6 h-32 w-32 rounded-full bg-[rgba(255,123,51,0.22)] blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-6 h-36 w-36 rounded-full bg-[rgba(168,85,247,0.22)] blur-3xl" />
          <div className="relative space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-primary)]/40 bg-[rgba(255,123,51,0.15)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-primary)]">
              Submit Portal
            </span>
            <h1 className="text-3xl font-semibold text-white drop-shadow-[0_0_1.5rem_rgba(255,123,51,0.35)]">
            Submit a Grievance
            </h1>
            <h2 className="text-lg font-semibold text-white drop-shadow-[0_0_1.25rem_rgba(255,123,51,0.3)]">
            Submission guidelines:
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-[#f1deff]/80">
            <li style={{listStyleType: "disc"}}>Provide a clear and concise title summarizing the issue.</li>
            <li style={{listStyleType: "disc"}}>Include relevant dates, locations, and parties involved in the description.</li>
            <li style={{listStyleType: "disc"}}>Upload supporting documents such as images, letters, or receipts if applicable.</li>
            <li style={{listStyleType: "disc"}}>
              For sensitive matters, enable anonymous submission. You&apos;ll receive a tracking code for
              future reference.
            </li>
          </ul>
            <p className="text-base text-[#f1deff]/85">
              Share your concern with the institute grievance cell. Provide as much detail as possible to
              help us resolve your issue quickly.
            </p>
            <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(255,123,51,0.35)] bg-[rgba(255,123,51,0.12)] px-4 py-2 text-xs font-medium text-[var(--accent-primary)] shadow-[0_0_1.5rem_rgba(255,123,51,0.35)]">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
              Every submission generates a trackable case ID
            </div>
          </div>
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

        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06010f]/85 px-6 py-12">
            <div className="w-full max-w-md rounded-3xl border border-[rgba(163,255,109,0.25)] bg-gradient-to-br from-[#1a0823] via-[#12051b] to-[#06010f] p-8 text-center shadow-[0_0_3.5rem_rgba(163,255,109,0.35)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(163,255,109,0.4)] bg-[rgba(163,255,109,0.18)] text-3xl text-[#d8ffc2] shadow-[0_0_1.5rem_rgba(163,255,109,0.35)]">
                ✓
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-white drop-shadow-[0_0_1.5rem_rgba(255,123,51,0.3)]">
                Grievance Submitted!
              </h3>
              <p className="mt-3 text-sm text-[#f1deff]/80">
                {successMessage || "Your grievance has been successfully submitted."}
              </p>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 inline-flex items-center justify-center rounded-full border border-[var(--accent-secondary)] bg-[var(--accent-secondary)] px-5 py-2 text-sm font-semibold text-[#1a0b27] shadow-[0_0_2rem_rgba(168,85,247,0.35)] transition hover:-translate-y-[2px] hover:bg-[#c084fc]"
              >
                Close
              </button>
            </div>
          </div>
        )}

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
