import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import { scheduleDemandSupplyJob } from "./src/jobs/demandSupplyJob.js";
import { scheduleOverdueTrackerJob } from "./src/jobs/overdueTrackerJob.js";

// ── Website Settings Routes ───────────────────────────────────────────────────
import websiteSettingsRoutes from "./src/routes/websiteSettingsRoutes.js";
import eligibilitySettingsRoutes from "./src/routes/eligibilitySettingRoutes.js";
import orderJourneySettingsRoutes from "./src/routes/orderJourneySettingsRoutes.js";
import projectOrderRoutes from "./src/routes/ProjectorderRoutes.js";
import geoLocationRoutes from "./src/routes/GeolocationRoutes.js";
import demandSupplyRoutes from "./src/routes/demandSupplyRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import discomRoutes from "./src/routes/discomRoutes.js";
import countryRoutes from "./src/routes/countryRoutes.js";
import countryWebsiteSettingsRoutes from "./src/routes/countryWebsiteSettingsRoutes.js";
import brandRoutes from "./src/routes/brandRoutes.js";
import districtRoutes from "./src/routes/districtRoutes.js";
import projectTypeRoutes from "./src/routes/projectTypeRoutes.js";
import productConfigRoutes from "./src/routes/productConfigRoutes.js";

import customerPaymentSettingsRoutes from "./src/routes/customerPaymentSettingsRoutes.js";
import pricingRoutes from "./src/routes/pricingRoutes.js";
import pricingSystemSettingsRoutes from "./src/routes/pricingSystemSettingsRoutes.js";

// ── EPC Routes (converted to ESM, all under src/routes now) ─────────────────
import epcAuthRoutes from "./src/routes/epcAuthRoutes.js";
import epcEnquiryRoutes from "./src/routes/EpcEnquiryRoutes.js";
import epcOrderRoutes from "./src/routes/EpcOrderRoutes.js";
import epcProjectRoutes from "./src/routes/EpcProjectRoutes.js";
import epcTeamRoutes from "./src/routes/EpcTeamRoutes.js";
import epcCalendarRoutes from "./src/routes/EpcCalenderRoutes.js";
import epcPlanRoutes from "./src/routes/EpcPlanRoutes.js";
import epcWalletRoutes from "./src/routes/epcWalletRoutes.js"
import adminContestRoutes from "./src/routes/adminContestRoutes.js";
import epcContestRoutes from "./src/routes/epcContestRoutes.js";
import epcWalletSettingsRoutes from "./src/routes/EpcwalletsettingsRoutes.js"; 
import epcSystemSettingsRoutes from "./src/routes/epcSystemSettingsRoutes.js";
import epcAdminRoutes from "./src/routes/epcAdminRoutes.js";
import epcBulkRoutes from "./src/routes/epcBulkRoutes.js";
import epcSubscriptionSettingsRoutes from "./src/routes/epcSubscriptionSettingsRoutes.js";

//______light bill api-------//
import lightBillScanRoutes from "./src/routes/lightBillScanRoutes.js";

// ── Customer Portal ──────────────────────────────────────────────────────────
import customerRoutes from "./src/routes/customerRoutes.js";

// ── Lead Routes ──────────────────────────────────────────────────────────────
import leadRoutes from "./src/routes/leadRoutes.js";

// ── BDE Routes ───────────────────────────────────────────────────────────────
import bdeRoutes from "./src/routes/bdeRoutes.js";

// ── Payment Routes ───────────────────────────────────────────────────────────
import paymentRoutes from "./src/routes/paymentRoutes.js";
import upload from "./src/middleware/upload.js";

dotenv.config();

const app = express();

// ── Connect DB ─────────────────────────────────────────────────────────────
connectDB();

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (EPC docs, photos, PCR reports etc.)
// Without this line, uploaded images/files won't load on frontend.
app.use("/uploads", express.static("uploads"));

// ── CORS — allow frontend + admin panel + EPC client (if different port) ────
const allowedOrigins = [
  process.env.CLIENT_URL, // e.g. http://localhost:3001
  process.env.ADMIN_URL,  // e.g. http://localhost:3000
  process.env.EPC_CLIENT_URL, // e.g. http://localhost:5173 (optional, EPC frontend)
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://sunnovative-australia-project.onrender.com",
  "https://sunnovative-australia-project-admin.onrender.com" // Just in case they deploy admin too
].filter(Boolean);

if (allowedOrigins.length === 0) {
  console.warn(
    "⚠️  CLIENT_URL / ADMIN_URL env vars not set — allowing ALL origins for now so the site keeps working. " +
      "Set these in your hosting dashboard env vars for the backend service, then redeploy, to lock this down."
  );
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman / server-to-server (no origin)
      if (!origin) return callback(null, true);
      // If no origins configured yet, don't block the live site — just allow everything.
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);

// ── Health check ───────────────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.json({ status: "Sunnovative Website + EPC API running ✅" })
);

app.post("/api/upload-file", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "File missing" });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, fileUrl });
});

// ══════════════════════════════════════════════════════════════════════════
// WEBSITE / ADMIN SETTINGS ROUTES
// ══════════════════════════════════════════════════════════════════════════
app.use("/api/website-settings", websiteSettingsRoutes);
app.use("/api/eligibility-settings", eligibilitySettingsRoutes);
app.use("/api/order-journey-settings", orderJourneySettingsRoutes);
app.use("/api/project-orders", projectOrderRoutes);
app.use("/api/geo", geoLocationRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/discoms", discomRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/country-website-settings", countryWebsiteSettingsRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/demand-supply", demandSupplyRoutes);
app.use("/api/country-settings", countryWebsiteSettingsRoutes);
app.use("/api/project-pricing", pricingRoutes);
app.use("/api/pricing-system-settings", pricingSystemSettingsRoutes);
app.use("/api/project-types", projectTypeRoutes);
app.use("/api/product-configs", productConfigRoutes);

// Custom Australia Journeys

app.use("/api/admin/payment-settings", customerPaymentSettingsRoutes);

// ══════════════════════════════════════════════════════════════════════════
// EPC PARTNER PORTAL ROUTES
// ══════════════════════════════════════════════════════════════════════════
app.use("/api/epc/auth", epcAuthRoutes);
app.use("/api/epc/enquiries", epcEnquiryRoutes);
app.use("/api/epc/orders", epcOrderRoutes);
app.use("/api/epc/projects", epcProjectRoutes);
app.use("/api/epc/team", epcTeamRoutes);
app.use("/api/epc/calendar", epcCalendarRoutes);
app.use("/api/epc/plans", epcPlanRoutes);
app.use("/api/epc/wallet", epcWalletRoutes);
app.use("/api/epc/wallet-settings", epcWalletSettingsRoutes);
app.use("/api/epc/system-settings", epcSystemSettingsRoutes);
app.use("/api/epc/contests", epcContestRoutes);
app.use("/api/admin/epc", epcAdminRoutes);
app.use("/api/admin/contests", adminContestRoutes);
app.use("/api/epc-bulk", epcBulkRoutes);
app.use("/api/epc-subscription-settings", epcSubscriptionSettingsRoutes);

//___admin epc wallet _____//
app.use('/api/epc/wallet/settings', epcWalletSettingsRoutes)
//_______light bill route_____//
app.use("/api/light-bill", lightBillScanRoutes);

// ── Customer Portal Routes ────────────────────────────────────────────────────
app.use("/api/customer", customerRoutes);

// ── Lead Management ──────────────────────────────────────────────────────────
app.use("/api/leads", leadRoutes);
app.use("/api/bde", bdeRoutes);


// ── Payment Routes ────────────────────────────────────────────────────────────
app.use("/api/payments", paymentRoutes);

// ── Blog Routes ───────────────────────────────────────────────────────────────
import blogRoutes from "./src/routes/blogRoutes.js";
app.use("/api/blogs", blogRoutes);


// ── Order Journey Project Types Route (For Frontend Compatibility) ────────────
app.get("/api/order-journey/:country", async (req, res) => {
  try {
    let rawCountry = req.params.country.toLowerCase();
    if (rawCountry === 'project-types' && req.query.country) {
      rawCountry = req.query.country.toLowerCase();
    }
    const countryMap = {
      au: "australia",
      nz: "new_zealand",
      uk: "uk",
      usa: "usa",
      in: "india",
      india: "india",
      australia: "australia",
      new_zealand: "new_zealand"
    };
    const dbCountry = countryMap[rawCountry] || "india";
    const { OrderJourneySettings } = await import("./src/models/OrderJourneySettings.js");
    const settings = await OrderJourneySettings.findOne({
      country: dbCountry,
      state: "all",
      district: "all"
    });
    if (!settings) {
      return res.json({ projectTypes: [] });
    }
    const projectTypes = settings.journeys.map(j => ({
      projectType: j.projectType,
      projectTypeLabel: j.projectTypeLabel || j.projectType,
      enabled: j.enabled
    }));
    res.json({ projectTypes });
  } catch (err) {
    console.error("Error in /api/order-journey/:country:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

// ── Start ────────────────────────────────────────────────────────────────
const port = process.env.PORT || 4005;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  
  // Start background jobs
  scheduleDemandSupplyJob();
  scheduleOverdueTrackerJob();
});// trigger nodemon
