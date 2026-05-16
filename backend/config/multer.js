import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "./cloudinary.js";

const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "interview-buddy/resumes",
    allowed_formats: ["pdf", "doc", "docx"],
    resource_type: "raw",
    flags: "attachment:false",
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "interview-buddy/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
    transformation: [{ width: 300, height: 300, crop: "fill" }],
  },
});

export const uploadResume = multer({ storage: resumeStorage });
export const uploadAvatar = multer({ storage: avatarStorage });