import multer from "multer"
import path from 'path';
import fs from 'fs';
import { Request, Response } from "express";

// ✅ ensure uploads folder exists
const uploadPath = 'uploads/';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// ✅ storage config
const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req: Request, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

// ✅ file filter (only images)
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// ✅ upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;