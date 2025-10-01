# Firestore Composite Indexes

Certain Firestore queries in the grievance portal require composite indexes. Create the following in the Firebase console under **Build → Firestore → Indexes → Composite**.

## Required Indexes

- **`notifications` by `recipientId` + `createdAt desc`**
  - **Collection**: `notifications`
  - **Fields**:
    - `recipientId` (Ascending)
    - `createdAt` (Descending)
  - **Purpose**: Supports `useNotifications()` fetching latest notifications for a user filtered by `recipientId` and ordered by `createdAt`.

## Creating Indexes

1. Open https://console.firebase.google.com/project/studentgrievances-c4b23/firestore/indexes
2. Click **Create index** under the Composite tab.
3. Supply the collection and fields shown above.
4. Save and wait for the index to finish building (typically a few minutes).

Keep this file updated as new composite queries are added.
