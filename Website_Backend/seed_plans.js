import mongoose from 'mongoose';
import EpcPlan from './src/models/EpcPlan.js';
import EpcKwPackage from './src/models/EpcKwPackage.js';
import EpcInstallerConfig from './src/models/EpcInstallerConfig.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost:27017/EmergeSunDB");
    console.log("Connected to MongoDB for seeding");

    // We will clear out all existing plans, packages and installer configs and start fresh
    await EpcPlan.deleteMany({});
    await EpcKwPackage.deleteMany({});
    await EpcInstallerConfig.deleteMany({});

    // === INDIA DATA ===
    const indiaPlans = [
      {
        country: "India", name: "Standard", minYearsExperience: 1, maxDistricts: 1, maxOrdersPerMonth: 5,
        monthlyPrice: 0, annualPrice: 0, features: ["Basic Support", "Limited Leads", "1 District Access"]
      },
      {
        country: "India", name: "Professional", minYearsExperience: 3, maxDistricts: 3, maxOrdersPerMonth: 20,
        monthlyPrice: 999, annualPrice: 9990, features: ["Priority Support", "Verified Leads", "Up to 3 Districts", "Dedicated Account Manager"]
      },
      {
        country: "India", name: "Enterprise", minYearsExperience: 5, maxDistricts: 10, maxOrdersPerMonth: 9999,
        monthlyPrice: 2999, annualPrice: 29990, features: ["24/7 Dedicated Support", "Unlimited Premium Leads", "Up to 10 Districts", "Custom Integrations", "Top Tier Visibility"]
      }
    ];

    const indiaPackages = [
      { country: "India", name: "Starter Pack", kwAmount: 20, basePrice: 10000, discountPercent: 0, finalPrice: 10000, isPopular: false },
      { country: "India", name: "Growth Pack", kwAmount: 50, basePrice: 25000, discountPercent: 10, finalPrice: 22500, isPopular: true },
      { country: "India", name: "Pro Pack", kwAmount: 100, basePrice: 50000, discountPercent: 20, finalPrice: 40000, isPopular: false }
    ];

    const indiaInstallerConfig = {
      country: "India",
      weeklyKwCapacityPerInstaller: 25,
      extraInstallerPrice: 50000,
      billingCycle: "Yearly"
    };

    // === AUSTRALIA DATA ===
    const ausPlans = [
      {
        country: "Australia", name: "Starter", minYearsExperience: 1, maxDistricts: 1, maxOrdersPerMonth: 5,
        monthlyPrice: 0, annualPrice: 0, features: ["Standard Support", "Basic Residential Leads", "1 Postcode Region"]
      },
      {
        country: "Australia", name: "Business", minYearsExperience: 3, maxDistricts: 3, maxOrdersPerMonth: 25,
        monthlyPrice: 49, annualPrice: 490, features: ["Priority Support", "Verified Commercial & Residential Leads", "Up to 3 Regions", "Account Manager"]
      },
      {
        country: "Australia", name: "National", minYearsExperience: 5, maxDistricts: 15, maxOrdersPerMonth: 9999,
        monthlyPrice: 149, annualPrice: 1490, features: ["24/7 Support", "Unlimited Leads", "State-wide Coverage", "Custom CRM Integration"]
      }
    ];

    const ausPackages = [
      { country: "Australia", name: "Basic KW", kwAmount: 20, basePrice: 200, discountPercent: 0, finalPrice: 200, isPopular: false },
      { country: "Australia", name: "Popular KW", kwAmount: 50, basePrice: 500, discountPercent: 10, finalPrice: 450, isPopular: true },
      { country: "Australia", name: "Volume KW", kwAmount: 100, basePrice: 1000, discountPercent: 20, finalPrice: 800, isPopular: false }
    ];

    const ausInstallerConfig = {
      country: "Australia",
      weeklyKwCapacityPerInstaller: 30, // E.g. slightly higher capacity in AUS per team
      extraInstallerPrice: 1200, // Price in AUD
      billingCycle: "Yearly"
    };

    // Insert everything
    await EpcPlan.insertMany([...indiaPlans, ...ausPlans]);
    await EpcKwPackage.insertMany([...indiaPackages, ...ausPackages]);
    
    await new EpcInstallerConfig(indiaInstallerConfig).save();
    await new EpcInstallerConfig(ausInstallerConfig).save();

    console.log("Seeding completed successfully for both countries!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding plans:", err);
    process.exit(1);
  }
};

seedData();
