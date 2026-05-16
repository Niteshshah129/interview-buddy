import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Signup
const signupUser = async (req, res) => {
  try {
    const { name, email, password, branch } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "fill in all fields" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    const user = await User.create({ name, email, password, branch });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.branch = req.body.branch || user.branch;
    user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;

    if (req.body.avatar === "") {
      if (user.avatarPublicId) {
        try {
          await cloudinary.uploader.destroy(user.avatarPublicId, {
            resource_type: "image",
          });
    
        } catch (err) {
        }
      } else if (user.avatar) {
        try {
          const urlParts = user.avatar.split("/");
          const folderAndFile = urlParts.slice(-2).join("/");
          const publicId = folderAndFile.split(".")[0];
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
  
        } catch (err) {
        }
      }
      user.avatar = "";
      user.avatarPublicId = "";
    }

    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      branch: updatedUser.branch,
      skills: updatedUser.skills,
      avatar: updatedUser.avatar,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Avatar
const updateAvatar = async (req, res) => {
  try {


    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId, {
          resource_type: "image",
        });
        
      } catch (err) {
       
      }
    }

    user.avatar = req.file.path;
    user.avatarPublicId = req.file.filename; // Cloudinary public_id

    await user.save();

    res.json({
      message: "Avatar updated!",
      avatar: user.avatar,
      avatarPublicId: user.avatarPublicId,
    });
  } catch (error) {

    res.status(500).json({ message: error.message || "Avatar upload failed" });
  }
};

export { signupUser, loginUser, getUserProfile, updateUserProfile, updateAvatar };