import { Router } from "express";
import { checkhealth, register, login, profile, getUserById, updateUser, getAllUsers, resetPassword, changePassword } from "../controllers/authController";
import { authMiddleware, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, profile);
router.get("/health-checkpoint", checkhealth);

// Self-service "forgot password": no session yet, so the old password
// itself is the proof of identity. Public route by design.
router.post("/change-password", changePassword);

// Admin-only: list accounts and reset a password from the admin panel
router.get("/", authMiddleware, requireAdmin, getAllUsers);
router.put("/:id/reset-password", authMiddleware, requireAdmin, resetPassword);

router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);


export default router;
