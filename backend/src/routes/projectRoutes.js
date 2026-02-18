const express = require("express");
const Project = require("../models/Project");
const Form = require("../models/Form");
const Response = require("../models/Response");

const router = express.Router();

// Create project with initial form
router.post("/", async (req, res) => {
  try {
    const { name, initialFormName } = req.body;
    if (!name || !initialFormName) {
      return res
        .status(400)
        .json({ message: "Name and initial form name required" });
    }

    const project = await Project.create({
      owner: req.user._id,
      name: String(name).trim(),
      initialFormName: String(initialFormName).trim(),
    });

    const defaultSection = {
      id: `sec_${Date.now()}`,
      title: "Section 1",
      color: "#11131c",
      components: [],
      conditions: [],
    };

    const form = await Form.create({
      projectId: project._id,
      owner: req.user._id,
      name: String(initialFormName).trim(),
      sections: [defaultSection],
    });

    res.status(201).json({ project, initialForm: form });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all projects for current user
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get recent work (projects and forms)
router.get("/recent", async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(6);
    const forms = await Form.find({ owner: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(6);

    res.json({ projects, forms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/rename", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: { name: String(name).trim() } },
      { new: true },
    );
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json({ message: "Project renamed", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/copy", async (req, res) => {
  try {
    const sourceProject = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!sourceProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const copiedProject = await Project.create({
      owner: req.user._id,
      name: `${sourceProject.name} (Copy)`,
      initialFormName: sourceProject.initialFormName || "Copied Form",
    });

    const sourceForms = await Form.find({
      owner: req.user._id,
      projectId: sourceProject._id,
    });

    if (sourceForms.length > 0) {
      const newForms = sourceForms.map((form) => {
        const formObj = form.toObject();
        return {
          projectId: copiedProject._id,
          owner: req.user._id,
          name: `${form.name} (Copy)`,
          description: formObj.description || "",
          backgroundColor: formObj.backgroundColor || "#0b0b10",
          sections: formObj.sections || [],
          isPublished: false,
          accessType: formObj.accessType || "anyone",
          allowedEmails: formObj.allowedEmails || [],
          views: 0,
          saveToProjectId: copiedProject._id,
        };
      });
      await Form.insertMany(newForms);
    }

    res.status(201).json({ message: "Project copied", project: copiedProject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const forms = await Form.find({
      owner: req.user._id,
      projectId: project._id,
    }).select("_id");
    const formIds = forms.map((f) => f._id);

    if (formIds.length > 0) {
      await Response.deleteMany({ form: { $in: formIds } });
      await Form.deleteMany({ _id: { $in: formIds } });
    }

    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/share", async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const shareLink = `/dashboard/projects?projectId=${project._id}`;
    res.json({ message: "Share link ready", shareLink, projectId: project._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
