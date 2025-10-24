import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { put } from "@vercel/blob";

const isProduction = process.env.NODE_ENV === "production";

// Configure storage based on environment
const storage = isProduction ? multer.memoryStorage() : multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx|xls/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

export const uploadSingle = upload.single("file");
export const uploadMultiple = upload.array("files", 10);

// Helper function to handle file upload based on environment
export const uploadFile = async (file: Express.Multer.File, folder: string = "uploads") => {
  if (isProduction) {
    // Use Vercel Blob in production
    const filename = `${folder}/${Date.now()}-${file.originalname}`;
    const { url } = await put(filename, file.buffer, { access: "public" });
    return url;
  } else {
    // Use local storage in development
    return `/uploads/${file.filename}`;
  }
};

export const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large" });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files" });
    }
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};