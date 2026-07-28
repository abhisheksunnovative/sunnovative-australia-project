import express from "express";
import {
  reverseGeocodeHandler,
  forwardGeocodeHandler,
  captureOrderLocation,
  findNearbyEPC,
  getAllProjectLocations,
} from "../controllers/geolocationcontroller.js";

const router = express.Router();

// Geocoding utilities
router.post("/reverse", reverseGeocodeHandler);
router.post("/forward", forwardGeocodeHandler);

// Project order location capture
router.put("/project-order/:orderId", captureOrderLocation);

// Nearby EPC + Dashboard map
router.get("/nearby-epc", findNearbyEPC);
router.get("/all-locations", getAllProjectLocations);

export default router;