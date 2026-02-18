const nodemailer = require("nodemailer");

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

const sendOTPEmail = async (email, otp) => {
  try {
    const { transporter, reason } = createTransporter();

    if (!transporter) {
      return { success: false, reason };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
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
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    return { success: false, reason: "smtp_error" };
  }
};

module.exports = { sendOTPEmail };
