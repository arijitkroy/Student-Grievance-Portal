import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/notifications", { method: "GET" });
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiFetch("/api/notifications/mark-read", { method: "POST" });
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  }, [loadNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return { notifications, loading, refresh: loadNotifications, markAllRead };
};

export default useNotifications;
