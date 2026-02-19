const nodemailer = require("nodemailer");
const https = require("https");

const RESEND_API_URL = "https://api.resend.com/emails";

const normalizedEnv = (value) =>
  String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .toLowerCase();

const buildOtpEmailTemplate = (otp) => ({
  subject: "CANOVA - Password Reset OTP",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #42aaf5; padding: 20px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">CANOVA</h1>
      </div>
      <div style="padding: 30px 20px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Password Reset OTP</h2>
        <p style="color: #666; font-size: 16px;">Hello,</p>
        <p style="color: #666; font-size: 16px;">You requested to reset your password. Use the OTP code below to reset your password:</p>
        <div style="background: #42aaf5; color: white; font-size: 24px; font-weight: bold; padding: 20px; border-radius: 8px; margin: 20px 0; letter-spacing: 3px;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">This OTP will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `,
});

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return { transporter: null, reason: "missing_credentials" };
  }

  const port = Number(process.env.EMAIL_PORT || 587);
  const secure =
    String(process.env.EMAIL_SECURE || "").toLowerCase() === "true" ||
    port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port,
    secure,
    service: process.env.EMAIL_SERVICE || undefined,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return { transporter, reason: null };
};

const postJson = (urlString, payload, headers = {}, timeoutMs = 15000) =>
  new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const body = JSON.stringify(payload);

    const req = https.request(
      {
        hostname: url.hostname,
        path: `${url.pathname}${url.search}`,
        port: url.port || 443,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          ...headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode || 0,
            body: data,
          });
        });
      },
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("Request timeout"));
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });

const sendViaSMTP = async (email, message) => {
  try {
    const { transporter, reason } = createTransporter();

    if (!transporter) {
      return { success: false, reason };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: message.subject,
      html: message.html,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    const reason =
      error && error.message && error.message.toLowerCase().includes("timeout")
        ? "smtp_timeout"
        : "smtp_error";
    return { success: false, reason };
  }
};

const sendViaResend = async (email, message) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from =
      process.env.RESEND_FROM || process.env.EMAIL_FROM || process.env.EMAIL_USER;

    if (!apiKey || !from) {
      return { success: false, reason: "missing_resend_config" };
    }

    const { statusCode, body } = await postJson(
      RESEND_API_URL,
      {
        from,
        to: [email],
        subject: message.subject,
        html: message.html,
      },
      {
        Authorization: `Bearer ${apiKey}`,
      },
    );

    if (statusCode >= 200 && statusCode < 300) {
      return { success: true };
    }

    console.error("Error sending OTP email with Resend:", statusCode, body);
    return { success: false, reason: "resend_error" };
  } catch (error) {
    console.error("Error sending OTP email with Resend:", error.message);
    return { success: false, reason: "resend_error" };
  }
};

const shouldUseResend = () => {
  const provider = normalizedEnv(process.env.EMAIL_PROVIDER);
  if (provider === "resend") return true;
  if (provider === "smtp") return false;

  return !process.env.EMAIL_USER && !!process.env.RESEND_API_KEY;
};

const shouldFallbackToResend = () =>
  !!process.env.RESEND_API_KEY &&
  normalizedEnv(process.env.EMAIL_FALLBACK_TO_RESEND) === "true";

const sendOTPEmail = async (email, otp) => {
  const message = buildOtpEmailTemplate(otp);

  if (shouldUseResend()) {
    return sendViaResend(email, message);
  }

  const smtpResult = await sendViaSMTP(email, message);
  if (smtpResult.success) return smtpResult;

  if (shouldFallbackToResend()) {
    return sendViaResend(email, message);
  }

  return smtpResult;
};

module.exports = { sendOTPEmail };
