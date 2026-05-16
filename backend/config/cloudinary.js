import dotenv from "dotenv";
dotenv.config();

import {v2 as cloudinary} from "cloudinary"
import {CloudinaryStorage} from "multer-storage-cloudinary"

cloudinary.config({
cloud_name:process.env.CLOUD_NAME,
api_key:process.env.CLOUD_API_KEY,
api_secret:process.env.CLOUD_API_SECRET
})

const storage=new CloudinaryStorage({
cloudinary,
params:(req, file) => {
  let resourceType = "raw";
  const fileType = file.mimetype;
  
  if (fileType.startsWith("image/")) {
    resourceType = "image";
  } else if (fileType === "application/pdf") {
    resourceType = "raw";
  }
  
  return {
    folder: "resumes",
    resource_type: resourceType
  };
}
})

export {cloudinary,storage}