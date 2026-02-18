const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Form = require("../models/Form");
const Response = require("../models/Response");

const router = express.Router();

// Get all forms for current user
router.get("/", async (req, res) => {
  try {
    const forms = await Form.find({ owner: req.user._id }).sort({
      updatedAt: -1,
    });
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new form under a project
router.post("/project/:projectId", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const defaultSection = {
      id: `sec_${Date.now()}`,
      title: "Section 1",
      color: "#11131c",
      components: [],
      conditions: [],
    };

    const form = await Form.create({
      projectId: req.params.projectId,
      owner: req.user._id,
      name: String(name).trim(),
      sections: [defaultSection],
    });

    res.status(201).json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Response summary for form owner (auth required) - must be before /:id
router.get("/:id/responses/summary", async (req, res) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, owner: req.user._id });
    if (!form) return res.status(404).json({ message: "Form not found" });
    const totalResponses = await Response.countDocuments({ form: form._id });
    const formObj = form.toObject();
    res.json({ totalResponses, views: formObj.views || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Per-question analytics for charts
router.get("/:id/responses/analytics", async (req, res) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, owner: req.user._id });
    if (!form) return res.status(404).json({ message: "Form not found" });

    const responses = await Response.find({ form: form._id });
    const byQuestion = {};

    form.sections.forEach((sec) => {
      (sec.components || []).forEach((cmp) => {
        if (cmp.type !== "question") return;
        const key = `${sec.id}__${cmp.id}`;
        byQuestion[key] = {
          sectionId: sec.id,
          componentId: cmp.id,
          title: cmp.title,
          questionType: cmp.questionType,
          options: cmp.options || [],
          counts: {},
          total: 0,
        };
      });
    });

    responses.forEach((r) => {
      (r.answers || []).forEach((a) => {
        const key = `${a.sectionId}__${a.componentId}`;
        if (!byQuestion[key]) return;
        const val =
          a.value !== undefined && a.value !== null ? String(a.value) : "";
        byQuestion[key].counts[val] = (byQuestion[key].counts[val] || 0) + 1;
        byQuestion[key].total += 1;
      });
    });

    res.json({
      byQuestion: Object.values(byQuestion),
      totalResponses: responses.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get form by id
router.get("/:id", async (req, res) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, owner: req.user._id });
    if (!form) return res.status(404).json({ message: "Form not found" });
    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update form (builder save / auto-save)
router.put("/:id", async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "backgroundColor",
      "sections",
      "accessType",
      "allowedEmails",
      "saveToProjectId",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const form = await Form.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: updates },
      { new: true },
    );

    if (!form) return res.status(404).json({ message: "Form not found" });
    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/rename", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Form name is required" });
    }

    const form = await Form.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: { name: String(name).trim() } },
      { new: true },
    );

    if (!form) return res.status(404).json({ message: "Form not found" });
    res.json({ message: "Form renamed", form });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/copy", async (req, res) => {
  try {
    const source = await Form.findOne({ _id: req.params.id, owner: req.user._id });
    if (!source) return res.status(404).json({ message: "Form not found" });

    const sourceData = source.toObject();
    const copiedForm = await Form.create({
      projectId: source.projectId,
      owner: req.user._id,
      name: `${source.name} (Copy)`,
      description: sourceData.description || "",
      backgroundColor: sourceData.backgroundColor || "#0b0b10",
      sections: sourceData.sections || [],
      isPublished: false,
      accessType: sourceData.accessType || "anyone",
      allowedEmails: sourceData.allowedEmails || [],
      views: 0,
      saveToProjectId: sourceData.saveToProjectId || source.projectId,
    });

    res.status(201).json({ message: "Form copied", form: copiedForm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const form = await Form.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!form) return res.status(404).json({ message: "Form not found" });

    await Response.deleteMany({ form: form._id });
    res.json({ message: "Form deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/share", async (req, res) => {
  try {
    const { accessType, allowedEmails } = req.body || {};
    const form = await Form.findOne({ _id: req.params.id, owner: req.user._id });
    if (!form) return res.status(404).json({ message: "Form not found" });

    if (accessType === "restricted" || accessType === "anyone") {
      form.accessType = accessType;
      form.allowedEmails = accessType === "restricted" ? allowedEmails || [] : [];
    }

    if (!form.publicSlug) {
      form.publicSlug = uuidv4();
    }
    form.isPublished = true;
    await form.save();

    res.json({
      message: "Share link ready",
      publicSlug: form.publicSlug,
      shareLink: `/respond/${form.publicSlug}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Publish & share form
router.post("/:id/publish", async (req, res) => {
  try {
    const { accessType, allowedEmails, saveToProjectId } = req.body;
    const form = await Form.findOne({ _id: req.params.id, owner: req.user._id });
    if (!form) return res.status(404).json({ message: "Form not found" });

    form.isPublished = true;
    form.accessType = accessType || "anyone";
    form.allowedEmails = accessType === "restricted" ? allowedEmails || [] : [];
    if (saveToProjectId) {
      form.saveToProjectId = saveToProjectId;
    }
    if (!form.publicSlug) {
      form.publicSlug = uuidv4();
    }

    await form.save();

    res.json({
      message: "Form published",
      publicSlug: form.publicSlug,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
