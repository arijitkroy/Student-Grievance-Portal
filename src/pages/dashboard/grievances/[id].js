import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import GrievanceTimeline from "@/components/GrievanceTimeline";
import CommentForm from "@/components/CommentForm";
import GrievanceStatusBadge from "@/components/GrievanceStatusBadge";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiFetch } from "@/lib/apiClient";
import { GRIEVANCE_STATUSES } from "@/lib/models";

const statusOptions = GRIEVANCE_STATUSES.map((status) => ({
  value: status,
  label: status.replace(/_/g, " "),
}));

const GrievanceDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useRequireAuth();
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [assignmentValue, setAssignmentValue] = useState("");
  const [previewAttachment, setPreviewAttachment] = useState(null);

  const loadGrievance = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch(`/api/grievances/${id}`);
      setGrievance(response.grievance);
    } catch (err) {
      setError(err.message || "Failed to load grievance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrievance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleComment = async (comment) => {
    setActionSubmitting(true);
    try {
      await apiFetch(`/api/grievances/${id}`, {
        method: "PATCH",
        body: { action: "comment", comment },
      });
      await loadGrievance();
    } catch (err) {
      setError(err.message || "Failed to post comment");
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleStatusUpdate = async (status, comment) => {
    setActionSubmitting(true);
    try {
      await apiFetch(`/api/grievances/${id}`, {
        method: "PATCH",
        body: { action: "status", status, comment },
      });
      await loadGrievance();
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleAssignment = async (assignedTo) => {
    setActionSubmitting(true);
    try {
      await apiFetch(`/api/grievances/${id}`, {
        method: "PATCH",
        body: { action: "assign", assignedTo },
      });
      await loadGrievance();
    } catch (err) {
      setError(err.message || "Failed to update assignment");
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleEscalation = async (comment) => {
    setActionSubmitting(true);
    try {
      await apiFetch(`/api/grievances/${id}`, {
        method: "PATCH",
        body: { action: "escalate", comment },
      });
      await loadGrievance();
    } catch (err) {
      setError(err.message || "Failed to escalate grievance");
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleFeedback = async ({ rating, comment }) => {
    setActionSubmitting(true);
    try {
      await apiFetch(`/api/grievances/${id}`, {
        method: "PATCH",
        body: { action: "feedback", rating, comment },
      });
      await loadGrievance();
    } catch (err) {
      setError(err.message || "Failed to submit feedback");
    } finally {
      setActionSubmitting(false);
    }
  };

  useEffect(() => {
    if (grievance) {
      setAssignmentValue(grievance.assignedTo || "");
    }
  }, [grievance]);

  const canLeaveFeedback = useMemo(() => {
    if (!grievance || !user) return false;
    return (
      grievance.status === "resolved" && grievance.createdBy === user.id && !grievance.resolutionFeedback
    );
  }, [grievance, user]);

  const renderAdminActions = () => {
    if (user?.role !== "admin" || !grievance) return null;

    return (
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Admin Actions</h2>
          <p className="text-sm text-slate-600">Update status, assign to a committee, or escalate.</p>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                value={grievance.status}
                onChange={(event) => handleStatusUpdate(event.target.value)}
                disabled={actionSubmitting}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Assign to department</label>
            <input
              type="text"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              value={assignmentValue}
              placeholder="Department or committee"
              onChange={(event) => setAssignmentValue(event.target.value)}
              onBlur={() => handleAssignment(assignmentValue)}
              disabled={actionSubmitting}
            />
          </div>
          <CommentForm
            title="Escalation Notes"
            onSubmit={handleEscalation}
            submitting={actionSubmitting}
          />
        </div>
      </div>
    );
  };

  const renderFeedbackSection = () => {
    if (!canLeaveFeedback) {
      return null;
    }

    const submitFeedback = async (event) => {
      event.preventDefault();
      await handleFeedback({ rating: feedbackRating, comment: feedbackComment });
    };

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Rate Resolution</h2>
        <form onSubmit={submitFeedback} className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">Rating</label>
            <select
              value={feedbackRating}
              onChange={(event) => setFeedbackRating(Number(event.target.value))}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              disabled={actionSubmitting}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Comments (optional)</label>
            <textarea
              value={feedbackComment}
              onChange={(event) => setFeedbackComment(event.target.value)}
              rows={4}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              placeholder="Share feedback about how the grievance was resolved"
              disabled={actionSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={actionSubmitting}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            Submit Feedback
          </button>
        </form>
      </section>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto mt-16 h-40 w-full max-w-3xl rounded-2xl border border-dashed border-slate-200 bg-slate-50" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-rose-600">
          {error}
        </div>
      </Layout>
    );
  }

  if (!grievance) {
    return (
      <Layout>
        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center text-slate-600">
          Grievance not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{grievance.title} | Grievance Portal</title>
      </Head>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <article className="flex-1 space-y-6">
          <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {grievance.grievanceNumber}
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900">{grievance.title}</h1>
                <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">
                  {grievance.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <GrievanceStatusBadge status={grievance.status} />
                <p className="text-xs text-slate-400">
                  Updated {new Date(grievance.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                {grievance.category}
              </span>
              {grievance.anonymous && (
                <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
                  Anonymous
                </span>
              )}
              {grievance.assignedTo && (
                <span className="rounded-full bg-indigo-100 px-3 py-1 font-medium text-indigo-600">
                  Assigned to {grievance.assignedTo}
                </span>
              )}
            </div>
            {grievance.attachments?.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold text-slate-700">Attachments</h3>
                <ul className="space-y-2 text-sm text-indigo-600">
                  {grievance.attachments.map((file, index) => {
                    const fallbackKey = `${file.fileName || "attachment"}-${index}`;
                    const href =
                      file.fileUrl ||
                      (file.base64 && file.fileType
                        ? `data:${file.fileType};base64,${file.base64}`
                        : null);

                    const hasPreview = Boolean(href);

                    return (
                      <li key={file.storagePath || file.fileUrl || fallbackKey}>
                        <button
                          type="button"
                          onClick={() =>
                            hasPreview &&
                            setPreviewAttachment({
                              ...file,
                              href,
                            })
                          }
                          className={`underline decoration-indigo-400 hover:text-indigo-500 ${
                            hasPreview ? "text-indigo-600" : "text-slate-400 cursor-not-allowed"
                          }`}
                          disabled={!hasPreview}
                        >
                          {file.fileName || `Attachment ${index + 1}`}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </header>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
            <div className="mt-4">
              <GrievanceTimeline history={grievance.history || []} />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Add Comment</h2>
            <p className="mt-1 text-sm text-slate-600">
              Share updates, respond to queries, or provide additional context.
            </p>
            <div className="mt-4">
              <CommentForm onSubmit={handleComment} submitting={actionSubmitting} />
            </div>
          </section>

          {renderFeedbackSection()}
        </article>

        <aside className="w-full lg:w-96 lg:flex-shrink-0 lg:space-y-6">
          {renderAdminActions()}
          {grievance.escalationLevel > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
              <p className="font-semibold">Escalated</p>
              <p className="mt-1">
                Current escalation level: {grievance.escalationLevel}. Senior committees have been
                notified.
              </p>
            </div>
          )}
          {grievance.resolutionFeedback && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              <p className="font-semibold">Resolution Feedback</p>
              <p className="mt-1 text-base">Rating: {grievance.resolutionFeedback.rating}/5</p>
              {grievance.resolutionFeedback.comment && (
                <p className="mt-2 text-sm text-emerald-700 whitespace-pre-wrap">
                  {grievance.resolutionFeedback.comment}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
      {previewAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {previewAttachment.fileName || "Attachment preview"}
                </h3>
                <p className="text-xs text-slate-500">{previewAttachment.fileType}</p>
              </div>
              <div className="flex items-center gap-3">
                {previewAttachment.href && (
                  <a
                    href={previewAttachment.href}
                    download={previewAttachment.fileName || undefined}
                    className="text-xs font-medium text-indigo-600 underline decoration-indigo-400 hover:text-indigo-500"
                  >
                    Download
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-slate-50 px-5 py-4">
              {(() => {
                const type = previewAttachment.fileType || "";
                const href = previewAttachment.href;
                const isImage = type.startsWith("image/");
                const isPdf = type === "application/pdf" || (previewAttachment.fileName || "").toLowerCase().endsWith(".pdf");

                if (isImage && href) {
                  return <img src={href} alt={previewAttachment.fileName || "Attachment"} className="mx-auto max-h-[70vh]" />;
                }

                if (isPdf && href) {
                  return (
                    <iframe
                      src={href}
                      title={previewAttachment.fileName || "PDF preview"}
                      className="h-[70vh] w-full rounded-lg border border-slate-200"
                    />
                  );
                }

                return (
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>Preview is unavailable for this file type.</p>
                    {href && (
                      <p>
                        <a
                          href={href}
                          download={previewAttachment.fileName || undefined}
                          className="font-medium text-indigo-600 underline decoration-indigo-400 hover:text-indigo-500"
                        >
                          Click here to download instead.
                        </a>
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GrievanceDetailPage;
