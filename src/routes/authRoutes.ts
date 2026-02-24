import { Router } from "express";
import { checkhealth, register, login, profile, getUserById, updateUser,getAllUsers } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, profile);
router.get("/health-checkpoint", checkhealth);


router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.get("/", getAllUsers);    


export default router;
