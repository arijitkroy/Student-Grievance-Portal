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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_0_2.5rem_rgba(168,85,247,0.2)] backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white drop-shadow-[0_0_1rem_rgba(255,123,51,0.3)]">Notifications</h2>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={!hasNotifications || loading}
          className="text-sm font-medium text-[var(--accent-secondary)] transition hover:text-[#c084fc] disabled:text-[#f1deff]/40"
        >
          Mark all as read
        </button>
      </div>
      <ul className="mt-4 space-y-3">
        {loading && (
          <li className="h-12 animate-pulse rounded-lg border border-white/10 bg-white/10" />
        )}
        {!hasNotifications && (
          <li className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f1deff]/70">
            You&apos;re all caught up.
          </li>
        )}
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`rounded-lg px-4 py-3 text-sm ${
              notification.read
                ? "border border-white/10 bg-white/5 text-[#f1deff]/75"
                : "border border-[var(--accent-primary)]/40 bg-[rgba(255,123,51,0.16)] text-[var(--accent-primary)] shadow-[0_0_1.5rem_rgba(255,123,51,0.25)]"
            }`}
          >
            <p className="font-medium">{notification.message}</p>
            <p className="text-xs text-[#f1deff]/60">
              {formatDate(notification.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPanel;
