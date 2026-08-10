import mongoose from "mongoose";

const installerRankingSettingsSchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true, default: "australia" },
  numberOfInstallersToDisplay: { type: Number, default: 3 },
  rankingPriority: {
    type: [String],
    enum: ["rating", "trustBadge", "distance", "availability", "performanceScore", "acceptanceRatio"],
    default: ["trustBadge", "rating", "acceptanceRatio"], // ordered = tie-break priority
  },
}, { timestamps: true });

export default mongoose.model("InstallerRankingSettings", installerRankingSettingsSchema);
