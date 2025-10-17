import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES } from "@/lib/models";

const RegisterPage = () => {
  const router = useRouter();
  const { register, verifyRegistrationOtp, user, loading } = useAuth();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    adminInviteCode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState("details");
  const [otp, setOtp] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");

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

  const handleDetailsSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await register(form);
      setOtpSessionId(response.sessionId || "");
      setOtpExpiresAt(response.expiresAt || "");
      setInfoMessage(response.message || "Enter the verification code sent to your email.");
      setStep("otp");
      setOtp("");
      setOtpError("");
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    setVerifying(true);
    setOtpError("");
    try {
      await verifyRegistrationOtp({
        sessionId: otpSessionId,
        otp,
        email: form.email,
        password: form.password,
      });
      router.push("/dashboard");
    } catch (err) {
      setOtpError(err.message || "Failed to verify OTP");
    } finally {
      setVerifying(false);
    }
  };

  const showDepartment = form.role === "staff";
  const showAdminCode = form.role === "admin";

  return (
    <Layout>
      <Head>
        <title>Register | LastCryy</title>
      </Head>
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_3rem_rgba(255,123,51,0.2)] backdrop-blur">
        <h1 className="text-3xl font-semibold text-white drop-shadow-[0_0_1.5rem_rgba(255,123,51,0.35)]">Create an account</h1>
        <p className="mt-2 text-sm text-[#f1deff]/80">
          Register as a student, staff member, or administrator to access the grievance portal.
        </p>
        <form
          onSubmit={step === "details" ? handleDetailsSubmit : handleOtpSubmit}
          className="mt-8 space-y-6"
        >
          {step === "details" ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#f1deff]">Full name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={form.displayName}
                    onChange={handleChange}
                    required
                    className="rounded-xl border border-white/10 bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(168,85,247,0.15)] placeholder:text-[#f7e8ff]/40 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#f1deff]">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="rounded-xl border border-white/10 bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(168,85,247,0.15)] placeholder:text-[#f7e8ff]/40 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#f1deff]">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="rounded-xl border border-white/10 bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(168,85,247,0.15)] placeholder:text-[#f7e8ff]/40 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-[#f1deff]">Role</span>
                <div className="grid gap-3 sm:grid-cols-3">
                  {USER_ROLES.map((role) => (
                    <label
                      key={role}
                      className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 text-sm capitalize transition ${
                        form.role === role
                          ? "border-[var(--accent-primary)]/60 bg-[rgba(255,123,51,0.15)] text-[var(--accent-primary)] shadow-[0_0_1.5rem_rgba(255,123,51,0.25)]"
                          : "border-white/10 bg-[#11051b]/80 text-[#f1deff]/70 hover:border-[var(--accent-secondary)]/40"
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
                      <span className="mt-1 text-xs text-[#f1deff]/60">
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
                  <label className="text-sm font-medium text-[#f1deff]">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="rounded-xl border border-white/10 bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(168,85,247,0.15)] placeholder:text-[#f7e8ff]/40 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
                    placeholder="E.g. Mechanical Engineering"
                  />
                </div>
              )}
              {showAdminCode && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#f1deff]">Admin invite code</label>
                  <input
                    type="text"
                    name="adminInviteCode"
                    value={form.adminInviteCode}
                    onChange={handleChange}
                    required
                    className="rounded-xl border border-white/10 bg-[#11051b] px-3 py-2 text-sm text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(168,85,247,0.15)] placeholder:text-[#f7e8ff]/40 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
                    placeholder="Enter the secure invite code"
                  />
                </div>
              )}
              {error && <p className="text-sm text-rose-400">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-[#1a0b27] shadow-[0_0_2rem_rgba(255,123,51,0.35)] transition hover:-translate-y-1 hover:bg-[#ff965f] disabled:cursor-not-allowed disabled:bg-[#6c3924]"
              >
                {submitting ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-2 rounded-2xl border border-[var(--accent-secondary)]/40 bg-[rgba(168,85,247,0.15)] p-4 text-sm text-[var(--accent-secondary)] shadow-[0_0_2.5rem_rgba(168,85,247,0.3)]">
                <p>{infoMessage || "Enter the verification code sent to your email."}</p>
                {otpExpiresAt && <p>Code expires at {new Date(otpExpiresAt).toLocaleTimeString()}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#f1deff]">One-time passcode</label>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.trim())}
                  required
                  maxLength={6}
                  className="rounded-xl border border-white/10 bg-[#11051b] px-3 py-2 text-sm tracking-widest text-[#f7e8ff] shadow-[0_0_1.5rem_rgba(168,85,247,0.2)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
                  placeholder="Enter 6-digit code"
                />
              </div>
              {otpError && <p className="text-sm text-rose-400">{otpError}</p>}
              <button
                type="submit"
                disabled={verifying}
                className="w-full rounded-full bg-[var(--accent-secondary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_2rem_rgba(168,85,247,0.4)] transition hover:-translate-y-1 hover:bg-[#c084fc] disabled:cursor-not-allowed disabled:bg-[#5b328f]"
              >
                {verifying ? "Verifying..." : "Verify and create account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setOtp("");
                  setOtpSessionId("");
                  setOtpExpiresAt("");
                  setInfoMessage("");
                  setDebugOtp("");
                  setOtpError("");
                }}
                className="w-full text-sm font-medium text-[var(--accent-primary)] transition hover:text-[#ff9a61]"
              >
                Start over
              </button>
            </>
          )}
        </form>
        <p className="mt-6 text-sm text-[#f1deff]/80">
          Already registered?
          <span className="ml-1">
            <a href="/login" className="font-semibold text-[var(--accent-secondary)] hover:text-[#c084fc]">
              Sign in
            </a>
          </span>
        </p>
      </div>
    </Layout>
  );
};

export default RegisterPage;
