import nodemailer from "nodemailer";

const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"];

const missingConfig = () => requiredEnv.filter((key) => !process.env[key]);

const createTransporter = () => {
  const missing = missingConfig();

  if (missing.length) {
    const message = `Missing SMTP configuration values: ${missing.join(", ")}`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    }
    console.warn(`[mailer] ${message}. Email delivery disabled in this environment.`);
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendNotificationEmail = async ({
  to,
  subject = "Grievance Portal Notification",
  message,
  displayName,
  link,
}) => {
  if (!to || !message) {
    console.warn("sendNotificationEmail called without recipient or message");
    return;
  }
  const transporter = getTransporter();
  if (!transporter) {
    console.info(
      `[mailer] Skipping notification email to ${to}. Message: ${message.slice(0, 120) || "(empty)"}`
    );
    return;
  }
  const greetingName = displayName || "there";
  const bodyLines = [
    `Hello ${greetingName},`,
    "",
    message,
    "",
    "Please sign in to the Grievance Portal for more details.",
  ];

  if (link) {
    bodyLines.push("", `Direct link: ${link}`);
  }

  const signInUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (signInUrl) {
    const normalized = signInUrl.endsWith("/") ? signInUrl.slice(0, -1) : signInUrl;
    bodyLines.push("", `Sign in: ${normalized}/login`);
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text: bodyLines.join("\n"),
    html: `
      <p>Hello ${greetingName},</p>
      <p>${message}</p>
      <p>Please sign in to the Grievance Portal for more details.</p>
      ${link ? `<p><a href="${link}" style="color:#a855f7;">View grievance details</a></p>` : ""}
      ${
        signInUrl
          ? `<p><a href="${signInUrl.endsWith("/") ? `${signInUrl}login` : `${signInUrl}/login`}" style="color:#facc15;">Sign in to the portal</a></p>`
          : ""
      }
    `,
  });
};

let cachedTransporter = null;

const getTransporter = () => {
  if (!cachedTransporter) {
    cachedTransporter = createTransporter();
  }
  return cachedTransporter;
};

export const sendRegistrationOtpEmail = async ({ to, displayName, otp, expiresAt }) => {
  const transporter = getTransporter();
  const expiresText = expiresAt ? new Date(expiresAt).toLocaleTimeString() : null;
  const signInUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  const normalizedSignIn = signInUrl
    ? signInUrl.endsWith("/")
      ? `${signInUrl}login`
      : `${signInUrl}/login`
    : null;

  if (!transporter) {
    console.info(
      `[mailer] OTP for ${to} (${displayName || "unknown"}) is ${otp}. Email delivery disabled in this environment.`
    );
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Your Grievance Portal verification code",
    text: [
      `Hello ${displayName || "there"},`,
      "",
      "Use the verification code below to finish creating your Grievance Portal account:",
      "",
      otp,
      "",
      expiresText ? `This code expires at ${expiresText}.` : "This code will expire soon.",
      "",
      normalizedSignIn ? `Sign in: ${normalizedSignIn}` : "",
      "If you did not request this, please ignore this message.",
    ].join("\n"),
    html: `
      <p>Hello ${displayName || "there"},</p>
      <p>Use the verification code below to finish creating your Grievance Portal account:</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>${expiresText ? `This code expires at ${expiresText}.` : "This code will expire soon."}</p>
      ${
        normalizedSignIn
          ? `<p><a href="${normalizedSignIn}" style="color:#facc15;">Sign in to the portal</a></p>`
          : ""
      }
      <p>If you did not request this, please ignore this message.</p>
    `,
  });
};
