import { adminDb, adminFieldValue, adminTimestamp } from "@/lib/firebaseAdmin";
import { GRIEVANCE_STATUSES, GRIEVANCE_CATEGORIES } from "@/lib/models";
import { serializeDocument } from "@/lib/serializers";

export const generateGrievanceNumber = async () => {
  const date = adminTimestamp.now().toDate();
  const year = date.getFullYear();
  const counterDocRef = adminDb.collection("metadata").doc(`grievanceCounter-${year}`);

  const counterDoc = await adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(counterDocRef);
    if (!doc.exists) {
      transaction.set(counterDocRef, { count: 1 });
      return { count: 1 };
    }

    const newCount = (doc.data().count || 0) + 1;
    transaction.update(counterDocRef, { count: newCount });
    return { count: newCount };
  });

  const paddedCount = `${counterDoc.count}`.padStart(4, "0");
  return `GRV-${year}-${paddedCount}`;
};

export const createGrievanceHistoryEntry = ({
  type,
  status = null,
  comment = "",
  updatedBy,
}) => ({
  type,
  status,
  comment,
  updatedBy,
  updatedAt: adminTimestamp.now(),
});

export const validateGrievancePayload = ({ category, title, description }) => {
  if (!category || !GRIEVANCE_CATEGORIES.includes(category)) {
    throw new Error("Invalid grievance category");
  }
  if (!title?.trim()) {
    throw new Error("Title is required");
  }
  if (!description?.trim()) {
    throw new Error("Description is required");
  }
};

export const updateGrievanceStatus = async ({ grievanceId, status, comment, updatedBy }) => {
  if (!GRIEVANCE_STATUSES.includes(status)) {
    throw new Error("Invalid status");
  }

  const grievanceRef = adminDb.collection("grievances").doc(grievanceId);
  const historyEntry = createGrievanceHistoryEntry({
    type: "status",
    status,
    comment,
    updatedBy,
  });

  await grievanceRef.update({
    status,
    updatedAt: adminTimestamp.now(),
    history: adminFieldValue.arrayUnion(historyEntry),
  });

  return historyEntry;
};

export const addGrievanceComment = async ({ grievanceId, comment, updatedBy }) => {
  const grievanceRef = adminDb.collection("grievances").doc(grievanceId);
  const historyEntry = createGrievanceHistoryEntry({
    type: "comment",
    comment,
    updatedBy,
  });

  await grievanceRef.update({
    updatedAt: adminTimestamp.now(),
    history: adminFieldValue.arrayUnion(historyEntry),
  });

  return historyEntry;
};

export const assignGrievance = async ({ grievanceId, assignedTo, updatedBy }) => {
  const grievanceRef = adminDb.collection("grievances").doc(grievanceId);
  const assignmentLabel = assignedTo ? `Assigned to ${assignedTo}` : "Assignment cleared";
  const historyEntry = createGrievanceHistoryEntry({
    type: "assignment",
    comment: assignmentLabel,
    updatedBy,
  });

  await grievanceRef.update({
    assignedTo: assignedTo || null,
    updatedAt: adminTimestamp.now(),
    history: adminFieldValue.arrayUnion(historyEntry),
  });

  return historyEntry;
};

export const escalateGrievance = async ({ grievanceId, comment, updatedBy }) => {
  const grievanceRef = adminDb.collection("grievances").doc(grievanceId);
  const historyEntry = createGrievanceHistoryEntry({
    type: "escalation",
    comment: comment || "Escalated to next level",
    updatedBy,
  });

  await grievanceRef.update({
    escalationLevel: adminFieldValue.increment(1),
    updatedAt: adminTimestamp.now(),
    history: adminFieldValue.arrayUnion(historyEntry),
  });

  return historyEntry;
};

export const submitResolutionFeedback = async ({ grievanceId, rating, comment, updatedBy }) => {
  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const grievanceRef = adminDb.collection("grievances").doc(grievanceId);
  const historyEntry = createGrievanceHistoryEntry({
    type: "feedback",
    comment: `Feedback submitted by ${updatedBy}`,
    updatedBy,
  });

  await grievanceRef.update({
    resolutionFeedback: {
      rating,
      comment: comment || "",
      submittedAt: adminTimestamp.now(),
    },
    updatedAt: adminTimestamp.now(),
    history: adminFieldValue.arrayUnion(historyEntry),
  });

  return historyEntry;
};

export const getGrievanceById = async (grievanceId) => {
  const grievanceDoc = await adminDb.collection("grievances").doc(grievanceId).get();
  if (!grievanceDoc.exists) {
    return null;
  }
  return serializeDocument(grievanceDoc);
};

export const getGrievancesForAnalytics = async () => {
  const snapshot = await adminDb.collection("grievances").get();
  return snapshot.docs.map((doc) => serializeDocument(doc));
};
