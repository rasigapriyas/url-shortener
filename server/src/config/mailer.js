// Email delivery with a safe development fallback.
//
// In production set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS and OTPs are
// emailed. When SMTP is not configured (local dev, demo) we DO NOT send a real
// email and DO NOT leak the OTP over the API. Instead the OTP is printed to the
// server console so it can still be tested end to end.

const nodemailer = require("nodemailer");

const isProd = process.env.NODE_ENV === "production";

// Accept SMTP_* (preferred) or EMAIL_* aliases.
const SMTP_HOST = process.env.SMTP_HOST || process.env.EMAIL_HOST;
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const SMTP_PORT = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
const SMTP_FROM =
  process.env.SMTP_FROM ||
  process.env.EMAIL_FROM ||
  (SMTP_USER ? `ShortLink <${SMTP_USER}>` : "ShortLink <no-reply@shortlink.app>");

const hasSmtp = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter = null;

if (hasSmtp) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    // 465 = implicit TLS; 587/others = STARTTLS
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  // Verify once at boot so misconfiguration is obvious in the logs.
  transporter.verify((err) => {
    if (err) {
      console.error(
        "[mailer] SMTP connection failed:",
        err.message,
        "\n[mailer] OTPs will be printed to the console until this is fixed."
      );
    } else {
      console.log(`[mailer] SMTP ready via ${SMTP_HOST}:${SMTP_PORT} as ${SMTP_USER}`);
    }
  });
} else {
  console.log(
    "[mailer] No SMTP configured — OTPs will be printed to the server console."
  );
}

const PURPOSE_COPY = {
  REGISTER: "Verify your ShortLink account",
  LOGIN: "Your ShortLink login code",
  FORGOT_PASSWORD: "Reset your ShortLink password",
};

const buildHtml = (otp, purpose) => {
  const title = PURPOSE_COPY[purpose] || "Your ShortLink code";
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f172a;color:#f8fafc;border-radius:16px">
    <h2 style="margin:0 0 8px">${title}</h2>
    <p style="color:#94a3b8;margin:0 0 24px">Use the code below. It expires in 5 minutes.</p>
    <div style="font-size:34px;font-weight:800;letter-spacing:10px;text-align:center;padding:18px;background:#1e293b;border-radius:12px">${otp}</div>
    <p style="color:#64748b;font-size:12px;margin-top:24px">If you didn't request this, you can ignore this email.</p>
  </div>`;
};

// Sends an OTP. Never throws — on failure it logs and falls back to the console
// so a mail outage can't break signup/reset. Returns true only when a real
// email was actually delivered.
const sendOtpEmail = async (email, otp, purpose = "REGISTER") => {
  const subject = PURPOSE_COPY[purpose] || "Your ShortLink code";
  const text = `Your ShortLink verification code is ${otp}. It expires in 5 minutes.`;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: SMTP_FROM,
        to: email,
        subject,
        text,
        html: buildHtml(otp, purpose),
      });
      console.log(`[mailer] Sent ${purpose} code to ${email}`);
      return true;
    } catch (err) {
      console.error(`[mailer] Failed to email ${email}:`, err.message);
      console.log(`[OTP] ${purpose} code for ${email}: ${otp} (email failed — console fallback)`);
      return false;
    }
  }

  // Dev fallback: never silently swallow the code.
  console.log(`[OTP] ${purpose} code for ${email}: ${otp} (expires in 5m)`);
  return false;
};

module.exports = {
  sendOtpEmail,
  // When true, the API may surface the OTP in the response for local testing.
  exposeOtpInResponse: !isProd && !hasSmtp,
};
