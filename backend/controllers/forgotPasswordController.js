import User from "../models/User.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

const otpStore = new Map();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// OTP generate - 6 digit
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @POST /api/forgot-password/send-otp
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "enter email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "There is no account with this email address." });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, { otp, expiresAt, verified: false });

    await transporter.sendMail({
      from: `"Interview Buddy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP - Interview Buddy",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #113155, #1a4a7a); padding: 30px; border-radius: 12px; text-align: center;">
            <h1 style="color: white; margin: 0;">Interview <span style="color: #1EB79C;">Buddy</span></h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 12px; margin-top: 20px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="color: #666;">You have requested a password reset. Please use the OTP below:</p>
            
            <div style="background: white; border: 2px dashed #1EB79C; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #113155; font-size: 40px; letter-spacing: 10px; margin: 0;">${otp}</h1>
            </div>
            
            <p style="color: #999; font-size: 14px;">This OTP expires in <strong>10 minutes</strong></p>
            <p style="color: #999; font-size: 14px;">If you did not request it, ignore this email.</p>
          </div>
        </div>
      `,
    });

    res.json({ message: "The OTP has been sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "The OTP could not be sent" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).json({ message: "OTP not found, please request a new one" });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP has expired, please request a new one" });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    otpStore.set(email, { ...stored, verified: true });

    res.json({ message: "OTP verified!", verified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const stored = otpStore.get(email);

    if (!stored || !stored.verified) {
      return res.status(400).json({ message: "Please verify the OTP first" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    otpStore.delete(email);

    res.json({ message: "Password successfully reset! Now login." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};