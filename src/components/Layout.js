import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import NotificationsPanel from "@/components/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";

const navLinks = [
  { href: "/", label: "Home", requiresAuth: false },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true },
  { href: "/dashboard/submit", label: "Submit Grievance", requiresAuth: true }
];

const Layout = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { notifications, loading: notificationsLoading, markAllRead, markOneRead } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    const handleClick = (event) => {
      const notificationsDropdown = document.getElementById("nav-notifications-dropdown");
      const profileDropdown = document.getElementById("nav-profile-dropdown");

      if (notificationsOpen && notificationsDropdown && !notificationsDropdown.contains(event.target)) {
        setNotificationsOpen(false);
      }

      if (profileMenuOpen && profileDropdown && !profileDropdown.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notificationsOpen, profileMenuOpen]);

  const handleNotificationClick = (notification) => {
    if (!notification) return;
    setNotificationsOpen(false);
    setProfileMenuOpen(false);
    if (notification.id) {
      markOneRead(notification.id);
    }
    if (notification.grievanceId) {
      router.push(`/dashboard/grievances/${notification.grievanceId}`);
    }
  };

  useEffect(() => {
    // redirect authenticated users away from public auth pages to dashboard
    // allow logged-in users to still visit the Home ("/") page;
    // only redirect away from auth pages
    if (!user) return;
    const redirectPaths = ["/login", "/register"];
    if (redirectPaths.includes(router.pathname)) {
      router.replace("/dashboard");
    }
  }, [user, router.pathname, router]);

  const visibleLinks = navLinks.filter((link) => {
    if (link.requiresAuth && !user) return false;
    if (link.roles && !link.roles.includes(user?.role)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1a0b27,#08020d_50%,#050109_100%)] text-[var(--foreground)]">
      <header className="sticky top-0 z-40 border-b border-[#301a41] bg-[#12071f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:gap-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--accent-primary)]/40 bg-white/10 p-1.5 shadow-[0_0_1.25rem_rgba(255,123,51,0.35)]">
              <Image src="/logo.png" alt="LastCryy logo" width={32} height={32} priority className="h-8 w-8" />
            </div>
            <span className="text-lg font-semibold text-[var(--accent-primary)] drop-shadow-[0_0_0.75rem_rgba(255,123,51,0.35)] sm:text-xl">
              LastCryy
            </span>
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-4 md:flex">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-[var(--accent-muted)] hover:text-[var(--accent-primary)]"
              >
                {link.label}
              </Link>
            ))}

            {!user && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-md border border-[var(--accent-primary)] bg-[#1c0f2b] px-3 py-1.5 text-sm font-medium text-[var(--accent-primary)] shadow-[0_0_1.25rem_rgba(255,123,51,0.35)] transition hover:bg-[var(--accent-primary)] hover:text-[#1c0f2b]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-[var(--accent-secondary)] px-3 py-1.5 text-sm font-medium text-white shadow-[0_0_1.25rem_rgba(168,85,247,0.4)] transition hover:bg-[#c084fc]"
                >
                  Register
                </Link>
              </div>
            )}

            {user && (
              <div className="flex items-center gap-3">
                <div className="relative" id="nav-notifications-dropdown">
                  <button
                    type="button"
                    aria-label="Show notifications"
                    onClick={() => setNotificationsOpen((open) => !open)}
                    className={`relative flex items-center justify-center rounded-full border border-[rgba(253,224,71,0.4)] bg-[#1c0f2b] p-2 text-[rgba(253,224,71,0.8)] shadow-[0_0_1.25rem_rgba(253,224,71,0.35)] transition hover:-translate-y-[2px] hover:bg-[rgba(253,224,71,0.12)] ${
                      notificationsOpen ? "ring-2 ring-[rgba(253,224,71,0.4)]" : ""
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a5 5 0 10-10 0v3.2c0 .5-.2 1-.6 1.4L6 17h5m4 0a3 3 0 11-6 0"
                      />
                    </svg>
                    {!notificationsLoading && notifications.some((n) => !n.read) && (
                      <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-[var(--accent-primary)] text-[10px] font-semibold text-[#1a0b27]" />
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 z-50 mt-3 w-80 max-w-[90vw] rounded-3xl border border-[rgba(253,224,71,0.25)] bg-[#12071f]/95 p-3 shadow-[0_0_2.5rem_rgba(253,224,71,0.25)] backdrop-blur">
                      <div className="max-h-[26rem] overflow-y-auto pr-1">
                        <NotificationsPanel
                          notifications={notifications}
                          loading={notificationsLoading}
                          onNotificationClick={handleNotificationClick}
                          onMarkAllRead={() => {
                            markAllRead();
                            setNotificationsOpen(false);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" id="nav-profile-dropdown">
                  <button
                    type="button"
                    aria-label="Open profile menu"
                    onClick={() => {
                      setProfileMenuOpen((open) => !open);
                      setNotificationsOpen(false);
                    }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(168,85,247,0.45)] bg-[rgba(168,85,247,0.12)] text-sm font-semibold text-white shadow-[0_0_1.25rem_rgba(168,85,247,0.35)] transition hover:-translate-y-[2px] hover:bg-[rgba(168,85,247,0.18)] ${
                      profileMenuOpen ? "ring-2 ring-[rgba(168,85,247,0.4)]" : ""
                    }`}
                  >
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 z-50 mt-3 w-48 rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-2 shadow-[0_0_2.5rem_rgba(168,85,247,0.25)] backdrop-blur">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          router.push("/dashboard/profile");
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-[#f1deff] transition hover:bg-[rgba(168,85,247,0.15)]"
                      >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(168,85,247,0.2)] text-xs font-semibold text-[var(--accent-secondary)]">{
                          user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"
                        }</span>
                        <span>Profile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                        }}
                        className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-[#f1deff] transition hover:bg-[rgba(255,123,51,0.18)]"
                      >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(255,123,51,0.18)] text-xs font-semibold text-[var(--accent-primary)]">↩</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>

          {/* mobile menu button */}
          <div className="flex md:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-md p-2 text-[#f4e9ff] transition hover:bg-[var(--accent-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <svg
                className={`h-6 w-6 transition-transform ${mobileOpen ? "rotate-90" : "rotate-0"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* mobile drawer */}
        <div
          className={`overflow-hidden border-t border-[#301a41] bg-[#160b25] transition-[max-height] duration-300 ease-in-out md:hidden ${
            mobileOpen ? "max-h-[600px]" : "max-h-0"
          }`}
        >
          <div className="mx-auto max-w-6xl px-4 pb-4 pt-3 sm:px-6">
            <nav className="flex flex-col gap-2">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-[var(--accent-muted)] hover:text-[var(--accent-primary)]"
                >
                  {link.label}
                </Link>
              ))}

              {!user && (
                <div className="mt-1 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md border border-[var(--accent-primary)] bg-[#1c0f2b] px-3 py-2 text-sm font-medium text-[var(--accent-primary)] shadow-[0_0_1.25rem_rgba(255,123,51,0.35)] transition hover:bg-[var(--accent-primary)] hover:text-[#1c0f2b]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md bg-[var(--accent-secondary)] px-3 py-2 text-sm font-medium text-white shadow-[0_0_1.25rem_rgba(168,85,247,0.4)] transition hover:bg-[#c084fc]"
                  >
                    Register
                  </Link>
                </div>
              )}

              {user && (
                <div className="mt-4 space-y-3">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] px-3 py-3 text-sm font-medium text-[#f1deff] transition hover:bg-[rgba(168,85,247,0.15)]"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(168,85,247,0.2)] text-sm font-semibold text-[var(--accent-secondary)]">{
                      user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"
                    }</span>
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center justify-center rounded-2xl border border-[var(--accent-primary)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-[#1a0b27] shadow-[0_0_1.5rem_rgba(255,123,51,0.35)] transition hover:bg-[#ff965f]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] bg-[rgba(26,12,45,0.55)] shadow-[0_0_3rem_rgba(255,123,51,0.18)] backdrop-blur" />
        {children}
      </main>

      <footer className="mt-16 border-t border-[#301a41] bg-[#0d0516]/95">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-sm text-slate-300 sm:flex-row sm:justify-between sm:px-6">
          <p className="drop-shadow-[0_0_0.5rem_rgba(255,123,51,0.35)]">© {new Date().getFullYear()} Institute Grievance Cell</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition hover:text-[var(--accent-primary)]">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-[var(--accent-primary)]">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
