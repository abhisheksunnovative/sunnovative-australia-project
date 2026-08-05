import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EpcPartner from '../models/EpcPartner.js';

dotenv.config({ path: 'Website_Backend/.env' });

const MONGODB_URI = process.env.MONGODB_URL || "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

const epcs = [
  {
    companyName: "Ausgrid Solar Solutions",
    ownerName: "David Miller",
    contactPerson: "David Miller",
    email: "epc.ausgrid@sunnovative.com",
    mobile: "0412345671",
    password: "123456",
    country: "australia",
    state: "New South Wales",
    district: "Sydney",
    city: "Sydney",
    pincode: "2000",
    address: "Level 12, 100 George St, Sydney NSW",
    yearsOfExperience: 10,
    totalExperience: "10 Years",
    qualifiedProjectTypes: ["au-small-home", "au-standard-family", "au-large-home", "au-ev-owners", "au-solar-battery", "Residential", "Commercial"],
    activeDistricts: ["Sydney", "Wattle Crescent", "New South Wales", "NSW", "all"],
    serviceAreas: [{ state: "New South Wales", district: "Sydney" }, { state: "New South Wales", district: "all" }],
    onboardingStatus: "Active",
    isVerified: true,
    rating: 4.9,
    totalRatings: 142,
    totalInstallations: 142,
    onTimeCompletionPercent: 98,
    isActive: true,
    kycDocuments: {
      abn: "12 345 678 901",
      cecAccreditationNumber: "CEC-NSW-98421",
      agreementSigned: true
    }
  },
  {
    companyName: "Endeavour Clean Energy",
    ownerName: "Sarah Jenkins",
    contactPerson: "Sarah Jenkins",
    email: "epc.endeavour@sunnovative.com",
    mobile: "0412345672",
    password: "123456",
    country: "australia",
    state: "New South Wales",
    district: "Sydney",
    city: "Sydney",
    pincode: "2000",
    address: "45 Macquarie St, Parramatta NSW",
    yearsOfExperience: 8,
    totalExperience: "8 Years",
    qualifiedProjectTypes: ["au-small-home", "au-standard-family", "au-large-home", "au-ev-owners", "au-solar-battery", "Residential", "Commercial"],
    activeDistricts: ["Sydney", "Wattle Crescent", "Melbourne", "New South Wales", "Victoria", "all"],
    serviceAreas: [{ state: "New South Wales", district: "Sydney" }, { state: "New South Wales", district: "all" }],
    onboardingStatus: "Active",
    isVerified: true,
    rating: 4.8,
    totalRatings: 98,
    totalInstallations: 98,
    onTimeCompletionPercent: 96,
    isActive: true,
    kycDocuments: {
      abn: "98 765 432 109",
      cecAccreditationNumber: "CEC-NSW-77412",
      agreementSigned: true
    }
  },
  {
    companyName: "Pacific Solar & Storage",
    ownerName: "Liam Hemsworth",
    contactPerson: "Liam Hemsworth",
    email: "epc.pacific@sunnovative.com",
    mobile: "0412345673",
    password: "123456",
    country: "australia",
    state: "Queensland",
    district: "Brisbane",
    city: "Brisbane",
    pincode: "4000",
    address: "88 Queen St, Brisbane QLD",
    yearsOfExperience: 12,
    totalExperience: "12 Years",
    qualifiedProjectTypes: ["au-small-home", "au-standard-family", "au-large-home", "au-ev-owners", "au-solar-battery", "Residential", "Commercial"],
    activeDistricts: ["Sydney", "Wattle Crescent", "Brisbane", "Queensland", "New South Wales", "all"],
    serviceAreas: [{ state: "New South Wales", district: "Sydney" }, { state: "Queensland", district: "all" }],
    onboardingStatus: "Active",
    isVerified: true,
    rating: 5.0,
    totalRatings: 215,
    totalInstallations: 215,
    onTimeCompletionPercent: 99,
    isActive: true,
    kycDocuments: {
      abn: "33 444 555 666",
      cecAccreditationNumber: "CEC-QLD-55120",
      agreementSigned: true
    }
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for EPC seeding...");

    for (const epcData of epcs) {
      let epc = await EpcPartner.findOne({ email: epcData.email });
      if (epc) {
        Object.assign(epc, epcData);
        await epc.save();
        console.log(`Updated EPC: ${epcData.companyName} (${epcData.email})`);
      } else {
        epc = new EpcPartner(epcData);
        await epc.save();
        console.log(`Created new EPC: ${epcData.companyName} (${epcData.email})`);
      }
    }

    console.log("Successfully seeded 3 Australian EPC Installers into database!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
