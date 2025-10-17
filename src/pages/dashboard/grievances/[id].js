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
  const [pendingStatus, setPendingStatus] = useState("");
  const [statusComment, setStatusComment] = useState("");
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
      if (comment) {
        setStatusComment("");
      }
    } catch (err) {
      setError(err.message || "Failed to update status");
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
      setPendingStatus(grievance.status || "");
      setStatusComment("");
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

    const isClosed = grievance.status === "resolved" || grievance.status === "rejected";

    return (
      <div className="space-y-6 rounded-3xl border border-[rgba(168,85,247,0.35)] bg-[#11051b] p-6 shadow-[0_0_2.5rem_rgba(168,85,247,0.2)]">
        <div>
          <h2 className="text-lg font-semibold text-white drop-shadow-[0_0_1rem_rgba(255,123,51,0.3)]">Admin Actions</h2>
          <p className="text-sm text-[#f1deff]/75">
            {isClosed
              ? "This grievance is closed. Further updates are disabled."
              : "Update status or add escalation notes."}
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#f1deff]">Status</label>
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="rounded-xl border border-[rgba(163,255,109,0.4)] bg-[#06020d] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(126,255,95,0.35)] focus:border-[rgba(163,255,109,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(126,255,95,0.55)]"
                value={pendingStatus}
                onChange={(event) => setPendingStatus(event.target.value)}
                disabled={actionSubmitting || isClosed}
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
            <label className="text-sm font-medium text-[#f1deff]">Escalation Notes</label>
            <textarea
              rows={4}
              value={statusComment}
              onChange={(event) => setStatusComment(event.target.value)}
              className="rounded-xl border border-[rgba(163,255,109,0.4)] bg-[#06020d] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(126,255,95,0.35)] placeholder:text-[#f7e8ff]/65 focus:border-[rgba(163,255,109,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(126,255,95,0.55)]"
              placeholder="Share updates or escalation context"
              disabled={actionSubmitting || isClosed}
            />
          </div>
          <button
            type="button"
            onClick={() =>
              handleStatusUpdate(
                pendingStatus,
                statusComment.trim() ? statusComment.trim() : undefined
              )
            }
            disabled={
              actionSubmitting ||
              !pendingStatus ||
              pendingStatus === grievance.status ||
              !statusComment.trim() ||
              isClosed
            }
            className="inline-flex items-center justify-center rounded-full border border-[var(--accent-secondary)] bg-[var(--accent-secondary)] px-4 py-2 text-sm font-semibold text-[#1a0b27] shadow-[0_0_2rem_rgba(168,85,247,0.35)] transition hover:-translate-y-1 hover:bg-[#c084fc] disabled:cursor-not-allowed disabled:border-[#5b328f] disabled:bg-[#5b328f] disabled:text-[#1f0a28]"
          >
            Post Update
          </button>
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
      <section className="rounded-3xl border border-[rgba(168,85,247,0.35)] bg-[#11051b] p-6 shadow-[0_0_2.5rem_rgba(168,85,247,0.2)]">
        <h2 className="text-lg font-semibold text-white drop-shadow-[0_0_1rem_rgba(255,123,51,0.3)]">Rate Resolution</h2>
        <form onSubmit={submitFeedback} className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#f1deff]">Rating</label>
            <select
              value={feedbackRating}
              onChange={(event) => setFeedbackRating(Number(event.target.value))}
              className="rounded-xl border border-[rgba(163,255,109,0.4)] bg-[#06020d] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(126,255,95,0.35)] focus:border-[rgba(163,255,109,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(126,255,95,0.55)]"
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
            <label className="text-sm font-medium text-[#f1deff]">Comments (optional)</label>
            <textarea
              value={feedbackComment}
              onChange={(event) => setFeedbackComment(event.target.value)}
              rows={4}
              className="rounded-xl border border-[rgba(163,255,109,0.4)] bg-[#06020d] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(126,255,95,0.35)] placeholder:text-[#f7e8ff]/65 focus:border-[rgba(163,255,109,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(126,255,95,0.55)]"
              placeholder="Share feedback about how the grievance was resolved"
              disabled={actionSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={actionSubmitting}
            className="inline-flex items-center rounded-full border border-[var(--accent-primary)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-[#1a0b27] shadow-[0_0_2rem_rgba(255,123,51,0.35)] transition hover:-translate-y-1 hover:bg-[#ff965f] disabled:cursor-not-allowed disabled:border-[#6c3924] disabled:bg-[#6c3924] disabled:text-[#2e0f1f]"
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
        <div className="mx-auto mt-16 h-40 w-full max-w-3xl rounded-3xl border border-dashed border-[rgba(168,85,247,0.4)] bg-[#11051b] shadow-[0_0_2.5rem_rgba(168,85,247,0.2)]" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-rose-400/40 bg-[rgba(244,63,94,0.12)] px-6 py-8 text-center text-rose-200 shadow-[0_0_2.5rem_rgba(244,63,94,0.25)]">
          {error}
        </div>
      </Layout>
    );
  }

  if (!grievance) {
    return (
      <Layout>
        <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-white/15 bg-[#11051b] px-6 py-8 text-center text-[#f1deff]/80 shadow-[0_0_2.5rem_rgba(168,85,247,0.15)]">
          Grievance not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{grievance.title} | LastCryy</title>
      </Head>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <article className="flex-1 space-y-6">
          <header className="relative overflow-hidden rounded-3xl border border-[rgba(163,255,109,0.35)] bg-gradient-to-br from-[#1a0823] via-[#12051b] to-[#06010f] p-6 shadow-[0_0_3rem_rgba(163,255,109,0.25)]">
            <div className="pointer-events-none absolute -left-12 top-8 h-32 w-32 rounded-full bg-[rgba(163,255,109,0.35)] blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-6 h-36 w-36 rounded-full bg-[rgba(168,85,247,0.25)] blur-3xl" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="md:flex-1 md:min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[rgba(163,255,109,0.75)]">
                  {grievance.grievanceNumber}
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-white drop-shadow-[0_0_1.5rem_rgba(255,123,51,0.35)] break-words">
                  {grievance.title}
                </h1>
                <p className="mt-2 text-sm text-[#f1deff]/85 whitespace-pre-wrap">
                  {grievance.description}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end md:flex-shrink-0">
                <GrievanceStatusBadge status={grievance.status} />
                <p className="text-xs text-[#f1deff]/60">
                  Updated {new Date(grievance.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#f1deff]/75">
              <span className="rounded-full border border-[rgba(163,255,109,0.45)] bg-[rgba(163,255,109,0.15)] px-3 py-1 font-medium text-[#d8ffc2]">
                {grievance.category}
              </span>
              {grievance.anonymous && (
                <span className="rounded-full border border-[rgba(253,224,71,0.45)] bg-[rgba(253,224,71,0.12)] px-3 py-1 font-medium text-[#fde68a]">
                  Anonymous
                </span>
              )}
              {grievance.assignedTo && (
                <span className="rounded-full border border-[rgba(168,85,247,0.4)] bg-[rgba(168,85,247,0.15)] px-3 py-1 font-medium text-[#e9d5ff]">
                  Assigned to {grievance.assignedTo}
                </span>
              )}
            </div>
            {grievance.attachments?.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold text-[#f1deff]">Attachments</h3>
                <ul className="space-y-2 text-sm text-[#c4b5fd]">
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
                          className={`underline decoration-[rgba(168,85,247,0.6)] transition ${
                            hasPreview
                              ? "text-[#e9d5ff] hover:text-[#facc15]"
                              : "cursor-not-allowed text-[#5b5b73]"
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

          <section className="relative overflow-hidden rounded-3xl border border-[rgba(163,255,109,0.35)] bg-gradient-to-br from-[#1a0823] via-[#12051b] to-[#06010f] p-6 shadow-[0_0_3rem_rgba(163,255,109,0.25)]">
            <div className="pointer-events-none absolute -left-12 top-6 h-28 w-28 rounded-full bg-[rgba(163,255,109,0.3)] blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-6 h-32 w-32 rounded-full bg-[rgba(168,85,247,0.25)] blur-3xl" />
            <div className="relative">
              <h2 className="text-lg font-semibold text-white drop-shadow-[0_0_1.5rem_rgba(255,123,51,0.3)]">Timeline</h2>
              <div className="mt-4">
                <GrievanceTimeline history={grievance.history || []} />
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-[rgba(163,255,109,0.35)] bg-gradient-to-br from-[#1a0823] via-[#12051b] to-[#06010f] p-6 shadow-[0_0_3rem_rgba(163,255,109,0.25)]">
            <div className="pointer-events-none absolute -left-10 top-8 h-28 w-28 rounded-full bg-[rgba(163,255,109,0.3)] blur-3xl" />
            <div className="pointer-events-none absolute -right-14 bottom-6 h-32 w-32 rounded-full bg-[rgba(168,85,247,0.25)] blur-3xl" />
            <div className="relative">
              <h2 className="text-lg font-semibold text-white drop-shadow-[0_0_1.5rem_rgba(255,123,51,0.3)]">Add Comment</h2>
              <p className="mt-1 text-sm text-[#f1deff]/80">
                Share updates, respond to queries, or provide additional context.
              </p>
              <div className="mt-4">
                <CommentForm onSubmit={handleComment} submitting={actionSubmitting} />
              </div>
            </div>
          </section>

          {renderFeedbackSection()}
        </article>

        <aside className="w-full lg:w-96 lg:flex-shrink-0 lg:space-y-6">
          {renderAdminActions()}
          {grievance.escalationLevel > 0 && (
            <div className="rounded-3xl border border-[rgba(253,224,71,0.45)] bg-[rgba(253,224,71,0.12)] px-5 py-4 text-sm text-[#fde68a] shadow-[0_0_2rem_rgba(253,224,71,0.25)]">
              <p className="font-semibold">Escalated</p>
              <p className="mt-1 text-[#fde68a]/85">
                Current escalation level: {grievance.escalationLevel}. Senior committees have been
                notified.
              </p>
            </div>
          )}
          {grievance.resolutionFeedback && (
            <div className="rounded-3xl border border-[rgba(34,197,94,0.45)] bg-[rgba(34,197,94,0.12)] px-5 py-4 text-sm text-emerald-100 shadow-[0_0_2rem_rgba(34,197,94,0.25)]">
              <p className="font-semibold">Resolution Feedback</p>
              <p className="mt-1 text-base text-emerald-100">Rating: {grievance.resolutionFeedback.rating}/5</p>
              {grievance.resolutionFeedback.comment && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-emerald-100/85">
                  {grievance.resolutionFeedback.comment}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
      {previewAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#06010f]/80 px-4 py-6"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-[rgba(168,85,247,0.35)] bg-[#0b0313] shadow-[0_0_3rem_rgba(168,85,247,0.3)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div>
                <h3 className="text-sm font-semibold text-[#f1deff]">
                  {previewAttachment.fileName || "Attachment preview"}
                </h3>
                <p className="text-xs text-[#f1deff]/60">{previewAttachment.fileType}</p>
              </div>
              <div className="flex items-center gap-3">
                {previewAttachment.href && (
                  <a
                    href={previewAttachment.href}
                    download={previewAttachment.fileName || undefined}
                    className="text-xs font-medium text-[#c4b5fd] underline decoration-[rgba(168,85,247,0.6)] transition hover:text-[#facc15]"
                  >
                    Download
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="rounded-full border border-[rgba(163,255,109,0.4)] px-3 py-1.5 text-xs font-semibold text-[#f7e8ff] shadow-[0_0_1rem_rgba(163,255,109,0.25)] transition hover:bg-[rgba(163,255,109,0.12)]"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-[#12051b] px-5 py-4">
              {(() => {
                const type = previewAttachment.fileType || "";
                const href = previewAttachment.href;
                const isImage = type.startsWith("image/");
                const isPdf = type === "application/pdf" || (previewAttachment.fileName || "").toLowerCase().endsWith(".pdf");

                if (isImage && href) {
                  return <img src={href} alt={previewAttachment.fileName || "Attachment"} className="mx-auto max-h-[70vh] rounded-2xl border border-white/10 shadow-[0_0_2rem_rgba(168,85,247,0.25)]" />;
                }

                if (isPdf && href) {
                  return (
                    <iframe
                      src={href}
                      title={previewAttachment.fileName || "PDF preview"}
                      className="h-[70vh] w-full rounded-2xl border border-white/10"
                    />
                  );
                }

                return (
                  <div className="space-y-3 text-sm text-[#f1deff]/80">
                    <p>Preview is unavailable for this file type.</p>
                    {href && (
                      <p>
                        <a
                          href={href}
                          download={previewAttachment.fileName || undefined}
                          className="font-medium text-[#c4b5fd] underline decoration-[rgba(168,85,247,0.6)] transition hover:text-[#facc15]"
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
