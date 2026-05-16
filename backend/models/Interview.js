import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: String, default: "" },
  questionText: { type: String, default: "" },
  answerText: { type: String, default: "" },
  difficulty: { type: String, default: "Medium" },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: { type: String, required: true },
    branch: { type: String, required: true },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    answeredQuestions: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    interviewType: { type: String, default: "text" },
    duration: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["completed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;