import { Router } from "express";
import { getPayrolls,uploadPayroll, addComment, approvePayroll, rejectPayroll, updatePayrollStage, downloadPayroll, deletePayroll } from "../controllers/payrollController";
import { upload } from "../config/multer";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// router.post("/create", upload.single("file"), uploadPayroll);
router.post(
    "/create",
    authMiddleware, 
    upload.single("file"),
    uploadPayroll
  );
router.get("/", getPayrolls);
router.post("/:id/comments",  authMiddleware, addComment);
router.post("/:id/approve", approvePayroll);
router.post("/:id/reject", rejectPayroll);
router.get('/:id/download', authMiddleware, downloadPayroll);
router.delete('/:id', authMiddleware, deletePayroll);


router.post("/:id/update", authMiddleware, updatePayrollStage);

export default router;