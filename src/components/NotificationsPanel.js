const formatDate = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    return new Date(value).toLocaleString();
  }
  if (value?._seconds) {
    return new Date(value._seconds * 1000).toLocaleString();
  }
  return "";
};

const NotificationsPanel = ({ notifications = [], onMarkAllRead, loading = false }) => {
  const hasNotifications = notifications.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={!hasNotifications || loading}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:text-slate-400"
        >
          Mark all as read
        </button>
      </div>
      <ul className="mt-4 space-y-3">
        {loading && (
          <li className="h-12 animate-pulse rounded-lg bg-slate-100" />
        )}
        {!hasNotifications && (
          <li className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
            You&apos;re all caught up.
          </li>
        )}
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`rounded-lg px-4 py-3 text-sm ${
              notification.read ? "bg-white text-slate-600" : "bg-indigo-50 text-indigo-700"
            }`}
          >
            <p className="font-medium">{notification.message}</p>
            <p className="text-xs text-slate-400">
              {formatDate(notification.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPanel;
