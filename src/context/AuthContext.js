import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseApp } from "@/lib/firebaseClient";

const AuthContext = createContext();

const auth = getAuth(firebaseApp);

auth.onAuthStateChanged(() => {
  // no-op, handled in provider via session endpoint
});

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Request failed");
  }
  return res.json();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJson("/api/auth/me", { method: "GET" });
      setUser(data.user);
    } catch (_) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(
    async (email, password) => {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      await fetchJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });
      await loadSession();
    },
    [loadSession]
  );

  const register = useCallback(
    async ({ email, password, displayName, role, department, adminInviteCode }) => {
      return fetchJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          step: "initiate",
          email,
          password,
          displayName,
          role,
          department,
          adminInviteCode,
        }),
      });
    },
    []
  );

  const verifyRegistrationOtp = useCallback(
    async ({ sessionId, otp, email, password }) => {
      await fetchJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          step: "verify",
          sessionId,
          otp,
          password,
        }),
      });
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    await fetchJson("/api/auth/logout", { method: "POST", body: JSON.stringify({}) });
    await signOut(auth);
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    reload: loadSession,
    verifyRegistrationOtp,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
