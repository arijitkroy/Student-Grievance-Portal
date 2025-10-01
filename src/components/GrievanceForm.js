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
          <label className="text-sm font-medium text-slate-700">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
            <label className="text-sm font-medium text-slate-700">Assign to (optional)</label>
            <input
              type="text"
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              placeholder="Department / Committee"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Summarize your grievance"
          className={`rounded-md border px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
            titleError ? "border-rose-400" : "border-slate-200"
          }`}
        />
        {titleError && <p className="text-xs text-rose-500">Title is required.</p>}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={6}
          placeholder="Provide detailed information about your grievance"
          className={`rounded-md border px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
            descriptionError ? "border-rose-400" : "border-slate-200"
          }`}
        />
        {descriptionError && <p className="text-xs text-rose-500">Description is required.</p>}
      </div>
      {showInitialComment && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Additional notes (optional)</label>
          <textarea
            name="initialComment"
            value={form.initialComment}
            onChange={handleChange}
            rows={4}
            placeholder="Add any additional context or comments for administrators"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Attachments</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
        />
        <p className="text-xs text-slate-500">Upload supporting images or documents. Allowed formats: PDF, PNG, JPG.</p>
      </div>
      {allowAnonymous && (
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="anonymous"
            checked={form.anonymous}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Submit anonymously (tracking code will be generated for status checks)
        </label>
      )}
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {submitting ? "Submitting..." : "Submit Grievance"}
        </button>
      </div>
    </form>
  );
};

export default GrievanceForm;
