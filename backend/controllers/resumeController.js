import Resume from "../models/Resume.js";
import { cloudinary } from "../config/cloudinary.js";

// Upload Resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      publicId: req.file.filename,
    });

    res.status(201).json({
      message: "Uploaded Successfully",
      resume,
    });
  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({
      uploadedAt: -1,
    });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Resume - DB + Cloudinary
export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "no access" });
    }

    try {
      if (resume.publicId) {
        await cloudinary.uploader.destroy(resume.publicId, {
          resource_type: "raw",
        });
      } else {
        const urlParts = resume.fileUrl.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.split(".")[0];
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "raw",
        });
      }
    } catch (cloudinaryError) {
      console.log("Cloudinary delete error:", cloudinaryError.message);
    }

    await Resume.findByIdAndDelete(id);

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.log("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};