import multer from "multer";
import fs from "fs";
import path from "path";

// Use process.cwd() to always resolve relative to project root
const uploadPath = path.join(process.cwd(), "uploads/payrolls");

// Create folder if missing
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

export const upload = multer({ storage });