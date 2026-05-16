import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  roundName: { type: String, required: true },
  description: { type: String, default: "" },
  topics: [{ type: String }],
  resources: [{ type: String }],
  tips: [{ type: String }],
  completed: { type: Boolean, default: false },
});

const weeklyPlanSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  title: { type: String, required: true },
  topics: [{ type: String }],
  tasks: [{ type: String }],
  resources: [{ type: String }],
  completed: { type: Boolean, default: false },
});

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Fresher", "Experienced"],
      required: true,
    },
    company: { type: String, required: true },
    jobRole: { type: String, required: true },
    totalWeeks: { type: Number, default: 12 },
    overview: { type: String, default: "" },
    rounds: [roundSchema],
    weeklyPlan: [weeklyPlanSchema],
    overallProgress: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);
export default Roadmap;