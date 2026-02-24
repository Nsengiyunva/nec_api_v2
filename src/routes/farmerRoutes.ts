import { Router } from "express";
import {
  createFarmer,
  getFarmers,
  getFarmerById,
  updateFarmer,
} from "../controllers/farmerController";

import { deactivateFarmer }  from "../controllers/nfaMainController";

const router = Router();

router.post("/", createFarmer);
router.get("/", getFarmers);
router.get("/:id", getFarmerById);
router.put("/:id", updateFarmer);
router.post("/deactivate",  deactivateFarmer);

export default router;
