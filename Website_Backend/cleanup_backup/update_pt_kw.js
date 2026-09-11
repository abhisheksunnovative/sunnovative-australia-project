import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://EmergeSunDbUser:Gvj15F49oE4uVl9i@emergesuncluster0.ui24irh.mongodb.net/emergesun?retryWrites=true&w=majority";

const schema = new mongoose.Schema({
  country: { type: String, required: true, lowercase: true },
  projectType: { type: String, required: true },
  availableKw: [{ type: String }]
}, { timestamps: true });

const ProjectType = mongoose.models.ProjectType || mongoose.model("ProjectType", schema);

const sizes = {
  "residential": ["3", "5", "6.6", "8.8", "10", "13.2", "15"],
  "commercial": ["15", "20", "30", "39.9", "50", "99.9"],
  "solar-battery": ["5", "6.6", "8.8", "10", "13.2"],
  "farm-rural": ["10", "15", "20", "30", "50"],
  "community-strata": ["20", "30", "50", "99.9"]
};

async function updateDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    for (const [key, availableKw] of Object.entries(sizes)) {
      const result = await ProjectType.updateMany(
        { country: "australia", projectType: key },
        { $set: { availableKw: availableKw } }
      );
      console.log(`Updated ${key}:`, result);
    }
    console.log("Done updating Project Types for Australia");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.connection.close();
  }
}

updateDB();
