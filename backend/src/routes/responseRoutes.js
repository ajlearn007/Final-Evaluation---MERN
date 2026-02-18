const express = require("express");
const Form = require("../models/Form");
const Response = require("../models/Response");

const router = express.Router();

// Submit responses for a form (public or restricted)
router.post("/form/:formId", async (req, res) => {
  try {
    const { responderEmail, answers } = req.body;
    const form = await Form.findById(req.params.formId);
    if (!form || !form.isPublished) {
      return res.status(404).json({ message: "Form not found or not published" });
    }

    if (form.accessType === "restricted") {
      if (!responderEmail || !form.allowedEmails.includes(responderEmail)) {
        return res.status(403).json({ message: "You do not have access to respond" });
      }
    }

    const responseDoc = await Response.create({
      form: form._id,
      responderEmail,
      answers: answers || [],
    });

    res.status(201).json({ message: "Response submitted", responseId: responseDoc._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Basic analytics per form (simple counts)
router.get("/form/:formId/summary", async (req, res) => {
  try {
    const formId = req.params.formId;
    const responses = await Response.find({ form: formId });
    const totalResponses = responses.length;

    res.json({
      totalResponses,
      // Placeholder for more complex analytics like counts per option
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

