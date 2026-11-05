import { Resend } from "resend";

let client;

const getClient = () => {
  if (!process.env.RESEND_API_KEY) return null;
  client ||= new Resend(process.env.RESEND_API_KEY);
  return client;
};

export const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// CLIENT_URL me kai origins ho sakte hain, pehla frontend ka main URL maana jata hai
export const getClientUrl = () =>
  (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")[0]
    .trim()
    .replace(/\/+$/, "");

export const emailTemplate = ({ title, intro, buttonText, link, footer }) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px">
    <h2 style="color:#111">${escapeHtml(title)}</h2>
    <p style="color:#444;line-height:1.6">${escapeHtml(intro)}</p>
    <p style="margin:28px 0">
      <a href="${escapeHtml(link)}"
         style="background:#2563eb;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">
        ${escapeHtml(buttonText)}
      </a>
    </p>
    <p style="color:#777;font-size:13px">${escapeHtml(footer)}</p>
  </div>`;

export const sendMail = async ({ to, subject, html }) => {
  const resend = getClient();
  if (!resend) throw new Error("RESEND_API_KEY is not configured");

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "DocNiva <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message || "Email send failed");
};

// Request ko mail ke liye nahi rokte. Fail ho to sirf server log me jata hai.
export const sendMailInBackground = (options) => {
  sendMail(options).catch((err) =>
    console.error(`Email failed (${options.subject}):`, err.message)
  );
};