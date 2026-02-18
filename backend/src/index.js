const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const projectRoutes = require("./routes/projectRoutes");
const formRoutes = require("./routes/formRoutes");
const responseRoutes = require("./routes/responseRoutes");
const sharedRoutes = require("./routes/sharedRoutes");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const Form = require("./models/Form");

app.use("/api/auth", authRoutes);
app.use("/api/projects", authMiddleware, projectRoutes);
app.get("/api/forms/public/slug/:slug", async (req, res) => {
  try {
    const form = await Form.findOne({
      publicSlug: req.params.slug,
      isPublished: true,
    });
    if (!form) return res.status(404).json({ message: "Form not found" });
    form.views = (form.views || 0) + 1;
    await form.save();
    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
app.use("/api/forms", authMiddleware, formRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/shared", authMiddleware, sharedRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
