import express from "express";
import { getBrands, createBrand, updateBrand, deleteBrand, uploadLogo } from "../controllers/brandController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/", getBrands);
router.post("/upload-logo", upload.single("logo"), uploadLogo);
router.post("/", createBrand);
router.put("/:id", updateBrand);
router.delete("/:id", deleteBrand);

export default router;
