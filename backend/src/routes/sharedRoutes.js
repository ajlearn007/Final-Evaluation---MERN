const express = require("express");
const Form = require("../models/Form");

const router = express.Router();

// Forms shared with current user (restricted list containing their email)
router.get("/", async (req, res) => {
  try {
    const email = req.user.email;
    const sharedForms = await Form.find({
      accessType: "restricted",
      allowedEmails: email,
      isPublished: true,
    })
      .sort({ updatedAt: -1 })
      .populate("owner", "name email");

    res.json(sharedForms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

