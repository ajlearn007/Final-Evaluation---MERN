const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    initialFormName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);

