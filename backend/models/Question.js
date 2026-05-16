import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    branch: { type: String, required: true },
    question: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    category: { type: String, default: "General" },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;