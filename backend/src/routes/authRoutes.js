const express = require("express");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { sendOTPEmail } = require("../services/emailService");

const router = express.Router();

const signToken = (user) => {
  const payload = { id: user._id };
  const secret = process.env.JWT_SECRET || "dev_secret";
  const expiresIn = "7d";
  return jwt.sign(payload, secret, { expiresIn });
};

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile || "",
  location: user.location || "USA",
  theme: user.theme || "light",
  role: user.role,
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: userResponse(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({
      token,
      user: userResponse(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security, do not reveal user existence
      return res.json({
        message: "If that email exists, an OTP has been sent.",
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otpCode = otpCode;
    user.otpExpiresAt = expires;
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otpCode);

    if (emailResult.success) {
      res.json({ message: "OTP sent to your email", emailSent: true });
    } else {
      if (process.env.NODE_ENV !== "production") {
        return res.status(200).json({
          message:
            "Email service unavailable in development. Use OTP from response.",
          emailSent: false,
          otp: otpCode,
          reason: emailResult.reason || "unknown",
        });
      }

      return res.status(500).json({
        message: "Unable to send OTP email right now. Please try again.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Create short-lived reset token
    const resetToken = uuidv4();
    user.resetToken = resetToken;
    user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    // clear otp
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ message: "OTP verified", resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const testOtp = "123456";
    const emailResult = await sendOTPEmail(email, testOtp);

    if (emailResult.success) {
      res.json({
        message: "Test email sent successfully",
        email: email,
        otp: testOtp,
      });
    } else {
      res.status(500).json({
        message: "Email service not configured",
        config: {
          hasUser: !!process.env.EMAIL_USER,
          hasPass: !!process.env.EMAIL_PASS,
        },
        reason: emailResult.reason || "unknown",
      });
    }
  } catch (err) {
    console.error("Test email error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, resetToken, password } = req.body;
    if (!email || !resetToken || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (
      !user ||
      !user.resetToken ||
      !user.resetTokenExpiresAt ||
      user.resetToken !== resetToken ||
      user.resetTokenExpiresAt < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.password = password; // will be hashed by pre-save hook
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: userResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/me", authMiddleware, async (req, res) => {
  try {
    const { name, email, mobile, location } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = String(name).trim() || user.name;

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({ message: "Email is required" });
      }
      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = normalizedEmail;
    }

    if (mobile !== undefined) user.mobile = String(mobile).trim();
    if (location !== undefined) {
      user.location = String(location).trim() || "USA";
    }

    await user.save();
    res.json({ message: "Profile updated", user: userResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/settings", authMiddleware, async (req, res) => {
  try {
    const { theme } = req.body;
    if (theme !== "light" && theme !== "dark") {
      return res.status(400).json({ message: "Invalid theme" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { theme } },
      { new: true },
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Settings updated", user: userResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
