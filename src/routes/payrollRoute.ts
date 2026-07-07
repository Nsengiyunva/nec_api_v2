import { Router } from "express";
import { getPayrolls, uploadPayroll, actionPayroll, downloadPayroll, deletePayroll } from "../controllers/payrollController";
import { upload } from "../config/multer";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post(
    "/create",
    authMiddleware,
    upload.single("file"),
    uploadPayroll
  );
router.get("/", authMiddleware, getPayrolls);
router.post("/:id/action", authMiddleware, actionPayroll);
router.get('/:id/download', authMiddleware, downloadPayroll);
router.delete('/:id', authMiddleware, deletePayroll);

export default router;