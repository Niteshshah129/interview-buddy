import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    branch: { type: String, default: "Not Set" },
    avatar: { type: String, default: "" },
    avatarPublicId: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resume: { type: String, default: "" },
    skills: [{ type: String }],
    totalInterviews: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;