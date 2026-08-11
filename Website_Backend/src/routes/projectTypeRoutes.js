import express from "express";
import {
  getProjectTypes,
  createProjectType,
  updateProjectType,
  deleteProjectType
} from "../controllers/projectTypeController.js";

const router = express.Router();

router.get("/", getProjectTypes);
router.post("/", createProjectType);
router.put("/:id", updateProjectType);
router.delete("/:id", deleteProjectType);

export default router;
