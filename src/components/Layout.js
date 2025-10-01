import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Home", requiresAuth: false },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true },
  { href: "/dashboard/submit", label: "Submit Grievance", requiresAuth: true },
  { href: "/admin", label: "Admin", requiresAuth: true, roles: ["admin"] },
];

const Layout = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold text-indigo-600">
            Grievance Portal
          </Link>
          <nav className="flex items-center gap-4">
            {navLinks
              .filter((link) => {
                if (link.requiresAuth && !user) return false;
                if (link.roles && !link.roles.includes(user?.role)) return false;
                return true;
              })
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
                >
                  {link.label}
                </Link>
              ))}
            {!user && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 shadow-sm transition hover:border-indigo-300"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
                >
                  Register
                </Link>
              </div>
            )}
            {user && (
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-transparent bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Institute Grievance Cell</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-indigo-600">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-indigo-600">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
