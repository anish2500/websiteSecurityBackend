import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";


const maxSize = 2 * 1024 * 1024; // 2MB
const PROFILE_UPLOAD_DIR = path.join(process.cwd(), "public", "profile_pictures");
const PLANT_UPLOAD_DIR = path.join(process.cwd(), "public", "plant_images");


[PROFILE_UPLOAD_DIR, PLANT_UPLOAD_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === "profilePicture") {
      cb(null, PROFILE_UPLOAD_DIR);
    } else if (file.fieldname ==="plantImage") {
      cb(null, PLANT_UPLOAD_DIR);
    }else {
      cb(new Error("Invalid field name for upload."), "");
    }
  },

  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === "plantImage" ? "plant" : "pro-pic";
    const uniqueName = `${prefix}-${uuidv4()}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
 const allowedFields = ["profilePicture", "plantImage"];

  if (!allowedFields.includes(file.fieldname)) {
    return cb(new Error("Invalid field name for upload."));
  }

  // 1. MIME type check
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});

// Maintain your existing exports so other files don't break
export const uploadProfilePicture = upload;
export const uploadImage = upload;
export const uploadPlantImage = upload;
