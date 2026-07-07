import { Router } from "express";
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffStats,
} from "../controllers/staffController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getAllStaff);
router.get("/stats", authMiddleware, getStaffStats);
router.get("/:id", authMiddleware, getStaffById);
router.post("/", authMiddleware, createStaff);
router.put("/:id", authMiddleware, updateStaff);
router.delete("/:id", authMiddleware, deleteStaff);

export default router;
