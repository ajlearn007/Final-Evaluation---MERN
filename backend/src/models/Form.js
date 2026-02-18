const mongoose = require("mongoose");

const ComponentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["question", "text", "image", "video", "logic"],
      required: true,
    },
    title: String,
    description: String,
    questionType: {
      type: String,
      enum: ["rating", "mcq", "dropdown", "linear", "shortAnswer", "longAnswer", "date"],
    },
    options: [String],
    mediaUrl: String,
    mediaType: {
      type: String,
      enum: ["image", "video", "file"],
    },
    scoreConfig: mongoose.Schema.Types.Mixed,
  },
  { _id: false },
);

const ConditionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    questionComponentId: String,
    operator: String,
    value: mongoose.Schema.Types.Mixed,
    targetSectionId: String,
    elseSectionId: String,
  },
  { _id: false },
);

const SectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    color: { type: String, default: "#11131c" },
    components: [ComponentSchema],
    conditions: [ConditionSchema],
  },
  { _id: false },
);

const formSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    backgroundColor: { type: String, default: "#0b0b10" },
    sections: [SectionSchema],
    isPublished: { type: Boolean, default: false },
    accessType: {
      type: String,
      enum: ["anyone", "restricted"],
      default: "anyone",
    },
    allowedEmails: [String],
    publicSlug: { type: String, unique: true },
    views: { type: Number, default: 0 },
    saveToProjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Form", formSchema);
