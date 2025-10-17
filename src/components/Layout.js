import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Home", requiresAuth: false },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true },
  { href: "/dashboard/submit", label: "Submit Grievance", requiresAuth: true },
  { href: "/admin", label: "Admin", requiresAuth: true, roles: ["admin"] },
];

const Layout = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

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
            <Image
              src="/logo.png"
              alt="LastCryy logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-[var(--accent-primary)]/40 bg-white/10 p-1 shadow-[0_0_1.25rem_rgba(255,123,51,0.35)]"
              priority
            />
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
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-transparent bg-[#2b123e] px-3 py-1.5 text-sm font-medium text-[var(--accent-primary)] shadow-[0_0_1.25rem_rgba(255,123,51,0.35)] transition hover:bg-[#3e1c57]"
              >
                Logout
              </button>
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
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="mt-2 w-full rounded-md border border-transparent bg-[#2b123e] px-3 py-2 text-sm font-medium text-[var(--accent-primary)] shadow-[0_0_1.25rem_rgba(255,123,51,0.35)] transition hover:bg-[#3e1c57]"
                >
                  Logout
                </button>
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
