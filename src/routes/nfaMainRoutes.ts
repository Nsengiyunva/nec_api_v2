import { Router, Request, Response } from "express";
import {
  NfaMain,
  NfaIndividual,
  NfaGroupMember,
  NfaBlockDetail,
  NfaHectareDetail,
  NfaSpouseDetail,
  NfaNok
} from "../models";
import { getDashboard, fetchFarmers } from "../controllers/farmerController";
import { getFarmer, createFarmer, updateFarmer } from "../controllers/nfaMainController";

const router = Router();

// GET all farmers with related data
router.get("/", async (req: Request, res: Response) => {
  try {
    const farmers = await NfaMain.findAll({
      include: [
        { model: NfaIndividual, as: "individuals" },
        { model: NfaGroupMember, as: "groupMembers" },
        { model: NfaBlockDetail, as: "blockDetails" },
        { model: NfaHectareDetail, as: "hectareDetails" },
        { model: NfaSpouseDetail, as: "spouseDetail" },
        { model: NfaNok, as: "noks" }
      ]
    });
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// GET single farmer by ID with related data
router.get("/farmers/:id", getFarmer);

//add farmer
router.post("/create", createFarmer);

// DELETE farmer
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const farmer = await NfaMain.findByPk(req.params.id);
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });

    await farmer.destroy();
    res.json({ message: "Farmer deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/stats/dashboard", getDashboard);
router.get("/all/farmers", fetchFarmers );
router.put("/farmer/:id", updateFarmer);

export default router;