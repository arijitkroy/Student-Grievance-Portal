import { requireAuth } from "@/lib/serverAuth";
import { getGrievancesForAnalytics } from "@/lib/grievances";

const parseDate = (value) => {
  if (!value) return null;
  try {
    return new Date(value);
  } catch (_) {
    return null;
  }
};

const toIsoString = (date) => (date instanceof Date && !Number.isNaN(date.valueOf()) ? date.toISOString() : null);

const diffHours = (start, end) => {
  if (!(start instanceof Date) || !(end instanceof Date)) return null;
  const ms = end - start;
  if (Number.isNaN(ms) || ms < 0) return null;
  return Number((ms / (1000 * 60 * 60)).toFixed(2));
};

const hoursToDays = (hours) => {
  if (hours === null || hours === undefined) return null;
  return Number((hours / 24).toFixed(2));
};

const resolveClosedAt = (grievance) => {
  const history = Array.isArray(grievance.history) ? grievance.history : [];
  const sortedStatusEvents = history
    .filter((entry) => entry?.type === "status" && entry?.status)
    .sort((a, b) => {
      const first = parseDate(a.updatedAt) || parseDate(a.createdAt);
      const second = parseDate(b.updatedAt) || parseDate(b.createdAt);
      return (first?.valueOf() || 0) - (second?.valueOf() || 0);
    });

  const closedStatuses = new Set(["resolved", "rejected"]);
  const firstClosedEvent = sortedStatusEvents.find((entry) => closedStatuses.has(entry.status));

  if (firstClosedEvent) {
    const closedAt = parseDate(firstClosedEvent.updatedAt) || parseDate(firstClosedEvent.createdAt);
    if (closedAt) {
      return { closedAt, closedStatus: firstClosedEvent.status };
    }
  }

  if (closedStatuses.has(grievance.status)) {
    const closedAt = parseDate(grievance.updatedAt) || parseDate(grievance.closedAt);
    if (closedAt) {
      return { closedAt, closedStatus: grievance.status };
    }
  }

  return { closedAt: null, closedStatus: null };
};

const buildAnalyticsRecord = (grievance) => {
  const createdAtDate = parseDate(grievance.createdAt);
  const { closedAt, closedStatus } = resolveClosedAt(grievance);
  const now = new Date();

  const resolutionHours = closedAt ? diffHours(createdAtDate, closedAt) : null;
  const currentDurationHours = diffHours(createdAtDate, closedAt || now);

  return {
    id: grievance.id,
    grievanceNumber: grievance.grievanceNumber || "",
    title: grievance.title || "Untitled grievance",
    category: grievance.category || "Uncategorized",
    status: grievance.status,
    closedStatus,
    assignedTo: grievance.assignedTo || null,
    anonymous: Boolean(grievance.anonymous),
    createdAt: grievance.createdAt || null,
    closedAt: toIsoString(closedAt),
    resolutionHours,
    resolutionDays: hoursToDays(resolutionHours),
    currentDurationHours,
    currentDurationDays: hoursToDays(currentDurationHours),
  };
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await requireAuth(req, res, { allowRoles: ["admin"], allowAnonymousUser: false });
    const grievances = await getGrievancesForAnalytics();
    const analytics = grievances.map(buildAnalyticsRecord).sort((a, b) => {
      const first = parseDate(b.createdAt)?.valueOf() || 0;
      const second = parseDate(a.createdAt)?.valueOf() || 0;
      return first - second;
    });

    return res.status(200).json({ analytics });
  } catch (error) {
    const status = error?.status || (error?.message === "UNAUTHENTICATED" ? 401 : 500);
    const message = error?.clientMessage || error?.message || "Failed to load analytics";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  }
}
