import { useCallback, useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/apiClient";
import { firestore } from "@/lib/firebaseClient";
import { serializeCollection } from "@/lib/serializers";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/notifications", { method: "GET" });
      setNotifications(data.notifications || []);
    } catch (error) {
      if (error.status === 401) {
        setNotifications([]);
      } else {
        console.error("Failed to load notifications", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiFetch("/api/notifications/mark-read", { method: "POST" });
    } catch (error) {
      if (error.status === 401) {
        setNotifications([]);
      } else {
        console.error("Failed to mark notifications as read", error);
      }
    }
  }, [loadNotifications]);

  const markOneRead = useCallback(
    async (notificationId) => {
      if (!notificationId) return;
      try {
        await apiFetch("/api/notifications/mark-read", {
          method: "POST",
          body: { notificationId },
        });
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification
          )
        );
      } catch (error) {
        if (error.status === 401) {
          setNotifications([]);
        } else {
          console.error("Failed to mark notification as read", error);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const notificationsRef = collection(firestore, "notifications");
    const notificationsQuery = query(
      notificationsRef,
      where("recipientId", "==", user.id),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        setNotifications(serializeCollection(snapshot));
        setLoading(false);
      },
      async (error) => {
        console.error("Notifications listener error", error);
        await loadNotifications();
      }
    );

    return () => {
      unsubscribe();
    };
  }, [authLoading, user?.id, loadNotifications]);

  return { notifications, loading, refresh: loadNotifications, markAllRead, markOneRead };
};

export default useNotifications;
