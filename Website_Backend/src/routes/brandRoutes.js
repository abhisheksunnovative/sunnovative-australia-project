import express from "express";
import { getBrands, createBrand, updateBrand, deleteBrand } from "../controllers/brandController.js";

const router = express.Router();

router.get("/", getBrands);
router.post("/", createBrand);
router.put("/:id", updateBrand);
router.delete("/:id", deleteBrand);

export default router;
