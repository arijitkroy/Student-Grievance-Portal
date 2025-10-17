import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const router = useRouter();
  const { login, loading, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && user) {
    router.replace("/dashboard");
  }

  return (
    <Layout>
      <Head>
        <title>Login | LastCryy</title>
      </Head>
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_3rem_rgba(255,123,51,0.2)] backdrop-blur">
        <h1 className="text-2xl font-semibold text-white drop-shadow-[0_0_1.5rem_rgba(255,123,51,0.35)]">Welcome back</h1>
        <p className="mt-2 text-sm text-[#f1deff]/80">
          Access your dashboard to track grievances and receive updates.
        </p>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-[#f1deff]">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="rounded-xl border border-white/10 bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(168,85,247,0.15)] placeholder:text-[#f7e8ff]/40 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-[#f1deff]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="rounded-xl border border-white/10 bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(168,85,247,0.15)] placeholder:text-[#f7e8ff]/40 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-[#1a0b27] shadow-[0_0_2rem_rgba(255,123,51,0.35)] transition hover:-translate-y-1 hover:bg-[#ff965f] disabled:cursor-not-allowed disabled:bg-[#6c3924]"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-sm text-[#f1deff]/80">
          Don&apos;t have an account?
          <span className="ml-1">
            <a href="/register" className="font-semibold text-[var(--accent-secondary)] hover:text-[#c084fc]">
              Register now
            </a>
          </span>
        </p>
      </div>
    </Layout>
  );
};

export default LoginPage;