import express from "express";
import {
  getDiscoms,
  createDiscom,
  updateDiscom,
  deleteDiscom
} from "../controllers/discomController.js";

const router = express.Router();

router.get("/", getDiscoms);
router.post("/", createDiscom);
router.put("/:id", updateDiscom);
router.delete("/:id", deleteDiscom);

export default router;
