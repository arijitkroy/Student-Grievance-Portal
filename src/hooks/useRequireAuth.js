import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export const useRequireAuth = ({ roles } = {}) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace({
        pathname: "/login",
        query: { redirect: router.asPath },
      });
      return;
    }

    if (roles && roles.length > 0 && !roles.includes(user.role)) {
      router.replace("/");
    }
  }, [loading, router, roles, user]);

  return { user, loading };
};

export default useRequireAuth;
