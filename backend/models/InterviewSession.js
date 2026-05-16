import mongoose from "mongoose"

const sessionSchema = new mongoose.Schema({

    userId: String,

    company: String,

    branch: String,

    score: Number,

    feedback: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model(
    "InterviewSession",
    sessionSchema
)