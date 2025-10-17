import cloudinary from "../config/Cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Practice-demo",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "svg"],
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  },
});

const upload = multer({ storage });

export default upload;