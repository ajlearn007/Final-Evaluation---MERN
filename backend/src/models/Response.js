const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    sectionId: String,
    componentId: String,
    value: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    form: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
    responderEmail: String,
    answers: [answerSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Response", responseSchema);

