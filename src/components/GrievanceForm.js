import { useState } from "react";
import { GRIEVANCE_CATEGORIES } from "@/lib/models";

const defaultFormState = {
  category: "Academic",
  title: "",
  description: "",
  anonymous: false,
  assignedTo: "",
  initialComment: "",
};

const GrievanceForm = ({
  onSubmit,
  submitting = false,
  allowAnonymous = true,
  showAssignmentField = false,
  showInitialComment = false,
}) => {
  const [form, setForm] = useState(defaultFormState);
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files || []));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setError("");
    if (!form.title.trim() || !form.description.trim()) {
      return;
    }
    try {
      const result = await onSubmit({ form, files });
      if (result?.reset) {
        setForm(defaultFormState);
        setFiles([]);
        setSubmitted(false);
      }
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || "Failed to submit grievance");
    }
  };

  const titleError = submitted && !form.title.trim();
  const descriptionError = submitted && !form.description.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#f1deff]">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="rounded-xl border border-[rgba(163,255,109,0.4)] bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(126,255,95,0.35)] focus:border-[rgba(163,255,109,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(126,255,95,0.55)]"
          >
            {GRIEVANCE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {showAssignmentField && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#f1deff]">Assign to (optional)</label>
            <input
              type="text"
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              placeholder="Department / Committee"
              className="rounded-xl border border-[rgba(163,255,109,0.4)] bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(126,255,95,0.35)] placeholder:text-[#f7e8ff]/40 focus:border-[rgba(163,255,109,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(126,255,95,0.55)]"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#f1deff]">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Summarize your grievance"
          className={`rounded-xl border px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(126,255,95,0.35)] focus:border-[rgba(163,255,109,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(126,255,95,0.55)] ${
            titleError ? "border-rose-400/60 bg-[rgba(244,63,94,0.12)]" : "border-[rgba(163,255,109,0.4)] bg-[#11051b]"
          }`}
        />
        {titleError && <p className="text-xs text-rose-300">Title is required.</p>}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#f1deff]">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={6}
          placeholder="Provide detailed information about your grievance"
          className={`rounded-xl border px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(126,255,95,0.35)] focus:border-[rgba(163,255,109,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(126,255,95,0.55)] ${
            descriptionError ? "border-rose-400/60 bg-[rgba(244,63,94,0.12)]" : "border-[rgba(163,255,109,0.4)] bg-[#11051b]"
          }`}
        />
        {descriptionError && <p className="text-xs text-rose-300">Description is required.</p>}
      </div>
      {showInitialComment && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#f1deff]">Additional notes (optional)</label>
          <textarea
            name="initialComment"
            value={form.initialComment}
            onChange={handleChange}
            rows={4}
            placeholder="Add any additional context or comments for administrators"
            className="rounded-xl border border-[rgba(163,255,109,0.4)] bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(126,255,95,0.35)] placeholder:text-[#f7e8ff]/40 focus:border-[rgba(163,255,109,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(126,255,95,0.55)]"
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#f1deff]">Attachments</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="rounded-xl border border-[rgba(163,255,109,0.4)] bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(126,255,95,0.35)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent-secondary)] file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white file:shadow-[0_0_1rem_rgba(168,85,247,0.4)] hover:border-[rgba(163,255,109,0.8)]"
        />
        <p className="text-xs text-[#f1deff]/60">Upload supporting images or documents. Allowed formats: PDF, PNG, JPG.</p>
      </div>
      {allowAnonymous && (
        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-[#f1deff] shadow-[0_0_1.5rem_rgba(168,85,247,0.2)]">
          <input
            type="checkbox"
            name="anonymous"
            checked={form.anonymous}
            onChange={handleChange}
            className="h-4 w-4 rounded border-white/30 bg-[#11051b] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
          />
          Submit anonymously (tracking code will be generated for status checks)
        </label>
      )}
      {error && (
        <div className="rounded-md border border-rose-400/40 bg-[rgba(244,63,94,0.12)] px-4 py-3 text-sm text-rose-200 shadow-[0_0_2rem_rgba(244,63,94,0.25)]">
          {error}
        </div>
      )}
      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-full border border-[var(--accent-primary)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-[#1a0b27] shadow-[0_0_2rem_rgba(255,123,51,0.35)] transition hover:-translate-y-1 hover:bg-[#ff965f] disabled:cursor-not-allowed disabled:border-[#6c3924] disabled:bg-[#6c3924] disabled:text-[#2e0f1f]"
        >
          {submitting ? "Submitting..." : "Submit Grievance"}
        </button>
      </div>
    </form>
  );
};

export default GrievanceForm;
