import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES } from "@/lib/models";

const RegisterPage = () => {
  const router = useRouter();
  const { register, user, loading } = useAuth();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    adminInviteCode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (event) => {
    const role = event.target.value;
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setSubmitting(false);
    }
  };

  const showDepartment = form.role === "staff";
  const showAdminCode = form.role === "admin";

  return (
    <Layout>
      <Head>
        <title>Register | Grievance Portal</title>
      </Head>
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Create an account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Register as a student, staff member, or administrator to access the grievance portal.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <input
                type="text"
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="Jane Doe"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="name@example.com"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              placeholder="At least 6 characters"
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <div className="grid gap-3 sm:grid-cols-3">
              {USER_ROLES.map((role) => (
                <label
                  key={role}
                  className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 text-sm capitalize transition ${
                    form.role === role
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={form.role === role}
                    onChange={handleRoleChange}
                    className="hidden"
                  />
                  <span className="font-semibold">{role}</span>
                  <span className="mt-1 text-xs text-slate-500">
                    {role === "student" && "Submit and track grievances"}
                    {role === "staff" && "Manage grievances for your department"}
                    {role === "admin" && "Oversee and resolve grievances"}
                  </span>
                </label>
              ))}
            </div>
          </div>
          {showDepartment && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Department</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="E.g. Mechanical Engineering"
              />
            </div>
          )}
          {showAdminCode && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Admin invite code</label>
              <input
                type="text"
                name="adminInviteCode"
                value={form.adminInviteCode}
                onChange={handleChange}
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="Enter the secure invite code"
              />
            </div>
          )}
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">
          Already registered?
          <span className="ml-1">
            <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </a>
          </span>
        </p>
      </div>
    </Layout>
  );
};

export default RegisterPage;
