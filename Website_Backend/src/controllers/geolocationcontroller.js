import { reverseGeocode, forwardGeocode, calculateDistance } from "../service/Geolocationservice .js";
import  EpcPartner  from "../models/EpcPartner.js";
import { ProjectOrder } from "../models/ProjectModel.js";

// ═══════════════════════════════════════════════════════════════════════════════
// REVERSE GEOCODE — Lat/Long se district/taluka/pincode nikalo
// POST /api/geo/reverse
// Body: { latitude, longitude }
// ═══════════════════════════════════════════════════════════════════════════════
export const reverseGeocodeHandler = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude aur longitude dono required hain",
      });
    }

    const result = await reverseGeocode(latitude, longitude);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("reverseGeocodeHandler error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORWARD GEOCODE — Address se Lat/Long nikalo
// POST /api/geo/forward
// Body: { address }
// ═══════════════════════════════════════════════════════════════════════════════
export const forwardGeocodeHandler = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || address.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Valid address do (min 5 characters)",
      });
    }

    const result = await forwardGeocode(address);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("forwardGeocodeHandler error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SAVE LOCATION TO PROJECT ORDER + AUTO REVERSE GEOCODE
// PUT /api/geo/project-order/:orderId
// Body: { latitude, longitude, captureMethod }
// Ye endpoint location capture karega AUR district/taluka/pincode automatically nikal ke save karega
// ═══════════════════════════════════════════════════════════════════════════════
export const captureOrderLocation = async (req, res) => {
  try {
    const { latitude, longitude, captureMethod = "gps-auto" } = req.body;
    const { orderId } = req.params;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude aur longitude required hain",
      });
    }

    // Reverse geocode karo
    const geoResult = await reverseGeocode(latitude, longitude);

    const locationData = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      capturedAt: new Date(),
      captureMethod,
    };

    if (geoResult.success) {
      locationData.address = geoResult.data.formattedAddress;
      locationData.district = geoResult.data.district;
      locationData.taluka = geoResult.data.taluka;
      locationData.pincode = geoResult.data.pincode;
      locationData.city = geoResult.data.city;
      locationData.state = geoResult.data.state || "Gujarat";
    }

    const updated = await ProjectOrder.findByIdAndUpdate(
      orderId,
      { location: locationData, lastActivityAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Order nahi mila" });
    }

    res.json({
      success: true,
      message: geoResult.success
        ? `Location captured! ${locationData.district}, ${locationData.state}`
        : "Lat/Long saved, lekin address detail nahi mila",
      data: {
        orderNumber: updated.orderNumber,
        location: updated.location,
      },
    });
  } catch (err) {
    console.error("captureOrderLocation error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FIND NEARBY EPC PARTNERS — district match + distance calculate
// GET /api/geo/nearby-epc?district=Rajkot&lat=22.30&lon=70.80
// ═══════════════════════════════════════════════════════════════════════════════
export const findNearbyEPC = async (req, res) => {
  try {
    const { district, lat, lon, limit = 10 } = req.query;

    if (!district && (!lat || !lon)) {
      return res.status(400).json({
        success: false,
        message: "District ya lat+lon mein se kuch toh do",
      });
    }

    // Approved EPC partners fetch karo
    let query = { status: "approved" };

    // Pehle district-wise match try karo (serviceDistricts array mein hai ya nahi)
    if (district) {
      query.serviceDistricts = new RegExp(district, "i");
    }

    let partners = await EpcPartner.find(query)
      .select("companyName city state serviceDistricts rating totalProjectsCompleted totalKwInstalled verificationBadge mobileNumber")
      .sort({ rating: -1, totalProjectsCompleted: -1 })
      .limit(Number(limit));

    // Agar district match se kuch nahi mila aur lat/lon hai, toh sabse fallback lo
    if (partners.length === 0 && lat && lon) {
      partners = await EpcPartner.find({ status: "approved" })
        .select("companyName city state serviceDistricts rating totalProjectsCompleted totalKwInstalled verificationBadge mobileNumber")
        .sort({ rating: -1 })
        .limit(Number(limit));
    }

    res.json({
      success: true,
      count: partners.length,
      searchedDistrict: district || null,
      data: partners,
    });
  } catch (err) {
    console.error("findNearbyEPC error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL PROJECT LOCATIONS — Admin dashboard map view ke liye
// GET /api/geo/all-locations
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllProjectLocations = async (req, res) => {
  try {
    const orders = await ProjectOrder.find({
      "location.latitude": { $ne: null },
    })
      .select("orderNumber customerName projectType status location completionPercentage")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      count: orders.length,
      data: orders.map((o) => ({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        projectType: o.projectType,
        status: o.status,
        completionPercentage: o.completionPercentage,
        latitude: o.location.latitude,
        longitude: o.location.longitude,
        district: o.location.district,
        city: o.location.city,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};