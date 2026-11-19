import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { HttpError } from "../utils/httpError.js";

const uploadDir = process.env.UPLOAD_DIR || "uploads";
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});

const allowed = new Set(["application/pdf", "image/jpeg", "image/png"]);
export const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (!allowed.has(file.mimetype)) return cb(new HttpError(400, "Only PDF, JPG and PNG files are allowed."));
    cb(null, true);
  }
});
