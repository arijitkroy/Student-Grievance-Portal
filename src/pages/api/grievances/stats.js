import { requireAuth } from "@/lib/serverAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { GRIEVANCE_STATUSES, GRIEVANCE_CATEGORIES } from "@/lib/models";
import { serializeCollection } from "@/lib/serializers";

const computeStats = (grievances, userRole) => {
  const totals = {
    total: grievances.length,
    byStatus: {},
    byCategory: {},
    resolvedCount: 0,
    avgResolutionTimeHours: 0,
    openCount: 0,
  };

  GRIEVANCE_STATUSES.forEach((status) => {
    totals.byStatus[status] = 0;
  });
  GRIEVANCE_CATEGORIES.forEach((category) => {
    totals.byCategory[category] = 0;
  });

  let resolutionTimeSum = 0;
  let resolvedCount = 0;

  grievances.forEach((grievance) => {
    const status = grievance.status || "submitted";
    totals.byStatus[status] = (totals.byStatus[status] || 0) + 1;

    const category = grievance.category || "Other";
    totals.byCategory[category] = (totals.byCategory[category] || 0) + 1;

    if (status === "resolved") {
      totals.resolvedCount += 1;
      resolvedCount += 1;
      if (grievance.createdAt && grievance.updatedAt) {
        const created = new Date(grievance.createdAt);
        const updated = new Date(grievance.updatedAt);
        const diffHours = (updated - created) / (1000 * 60 * 60);
        if (!Number.isNaN(diffHours) && diffHours >= 0) {
          resolutionTimeSum += diffHours;
        }
      }
    } else if (status !== "rejected") {
      totals.openCount += 1;
    }
  });

  totals.avgResolutionTimeHours = resolvedCount
    ? Number((resolutionTimeSum / resolvedCount).toFixed(1))
    : 0;

  if (userRole === "admin") {
    const inProgress = totals.byStatus.in_progress || 0;
    const inReview = totals.byStatus.in_review || 0;
    const submitted = totals.byStatus.submitted || 0;
    totals.openByStage = {
      submitted,
      in_review: inReview,
      in_progress: inProgress,
    };
  }

  return totals;
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const user = await requireAuth(req, res, { allowAnonymousUser: true });

    let query = adminDb.collection("grievances");
    if (user.role !== "admin") {
      query = query.where("createdBy", "==", user.id);
    }

    const snapshot = await query.limit(500).get();
    const grievances = serializeCollection(snapshot);

    const stats = computeStats(grievances, user.role);

    return res.status(200).json({ stats });
  } catch (error) {
    if (!res.headersSent) {
      const statusCode = error.message === "UNAUTHENTICATED" ? 401 : 500;
      res.status(statusCode).json({ message: error.message || "Failed to load stats" });
    }
  }
}
