# Firebase Data Model & Security Notes

## Collections Overview

### `users`
- **id**: Authentication UID (document ID)
- **displayName** *(string)***
- **email** *(string)*
- **role** *("student" | "staff" | "admin")*
- **department** *(string | null)*
- **anonymous** *(boolean)*
- **createdAt** *(Timestamp)*
- **updatedAt** *(Timestamp)*

### `grievances`
- **id** *(auto id)*
- **grievanceNumber** *(string, e.g. `GRV-2025-0001`)*
- **createdBy** *(string | null)*
- **category** *(enum → Academic, Hostel, Facilities, Administration, Other)*
- **title** *(string)*
- **description** *(string)*
- **attachments** *(array<Attachment>)*
- **status** *(enum → submitted, in_review, in_progress, resolved, rejected)*
- **assignedTo** *(string | null)*
- **history** *(array<HistoryEntry>)*
- **anonymous** *(boolean)*
- **resolutionFeedback** *(object | null)*
- **trackingHash** *(string | null)*
- **escalationLevel** *(number)*
- **createdAt** *(Timestamp)*
- **updatedAt** *(Timestamp)*

`HistoryEntry` structure:
```json
{
  "type": "status" | "comment" | "assignment" | "escalation" | "feedback",
  "status": "submitted" | "in_review" | "in_progress" | "resolved" | "rejected" | null,
  "comment": "string",
  "updatedBy": "uid | system",
  "updatedAt": "Timestamp"
}
```

`Attachment` structure:
```json
{
  "fileName": "string",
  "fileType": "string",
  "base64": "Base64 string",
  "size": number // bytes (capped at 2_097_152)
}
```

`resolutionFeedback` structure:
```json
{
  "rating": 1-5,
  "comment": "string",
  "submittedAt": "Timestamp"
}
```

### `notifications`
- **id** *(auto id)*
- **grievanceId** *(string)*
- **recipientId** *(string)*
- **message** *(string)*
- **read** *(boolean)*
- **createdAt** *(Timestamp)*

### `metadata`
- `grievanceCounter-{year}` documents track annual counters `{ count: number }`.

### `analyticsSnapshots`
- Optional periodic aggregates for dashboards `{ data: { totalGrievances, resolvedCount, avgResolutionTimeHours, byCategory, openByStage } }`.

## Environment Variables

Configure the following for both client and server runtimes:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY` *(JSON string for admin SDK)*
- `ADMIN_INVITE_CODE` *(string required for registering admins)*

## Security Rules Suggestions

- **Firestore**
  - Allow read/write only for authenticated users except anonymous grievance POST handled server-side.
  - Students/Staff: read own grievances, write to own documents (`createdBy == request.auth.uid`).
  - Admins: full access.
  - Notifications: restrict to `recipientId == request.auth.uid`.

- **Attachments**
  - Files are stored inline as Base64 in Firestore; enforce the 2 MB per file limit server-side (already applied in the `/api/grievances` POST handler).
  - Consider stripping EXIF or other metadata client-side if privacy is a concern.

## Testing & Verification

1. Populate `.env.local` with the environment variables.
2. Run `npm install` to fetch Firebase dependencies.
3. Start the dev server with `npm run dev` and create sample accounts.
4. Verify workflows:
   - Student submits grievances (with/without anonymous flag).
   - Admin assigns, updates status, escalates, and verifies notifications.
   - Student provides resolution feedback after status `resolved`.
5. Confirm Firestore `grievances` documents contain Base64 attachments with expected metadata (no Firebase Storage objects are created).

## Additional Hardening

- Enable Firebase App Check for client interactions.
- Configure Cloud Functions/Webhooks for email notifications (optional extension point).
- Monitor Firestore document sizes; consider migrating to external storage if attachments regularly exceed limits or retention demands grow.
