import express from "express";
import { getDistricts, getStates, createDistrict, updateDistrict, deleteDistrict } from "../controllers/districtController.js";

const router = express.Router();

router.get("/states", getStates);
router.get("/", getDistricts);
router.post("/", createDistrict);
router.put("/:id", updateDistrict);
router.delete("/:id", deleteDistrict);

export default router;
