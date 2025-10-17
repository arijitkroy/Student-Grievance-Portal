import nodemailer from "nodemailer";

const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"];

const checkConfig = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing SMTP configuration values: ${missing.join(", ")}`);
  }
};

const createTransporter = () => {
  checkConfig();
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
      "If you did not request this, please ignore this message.",
    ].join("\n"),
    html: `
      <p>Hello ${displayName || "there"},</p>
      <p>Use the verification code below to finish creating your Grievance Portal account:</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>${expiresText ? `This code expires at ${expiresText}.` : "This code will expire soon."}</p>
      <p>If you did not request this, please ignore this message.</p>
    `,
  });
};
