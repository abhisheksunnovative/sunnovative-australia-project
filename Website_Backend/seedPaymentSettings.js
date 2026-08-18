import mongoose from "mongoose";
import dotenv from "dotenv";
import CustomerPaymentSettings from "./src/models/CustomerPaymentSettings.js";
import { OrderJourneySettings } from "./src/models/OrderJourneySettings.js";

dotenv.config();

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/sunnovative";
    console.log("Connecting to database:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully.");

    const countries = ["india", "australia"];

    for (const country of countries) {
      console.log(`\nProcessing country: ${country}`);
      
      // 1. Fetch Order Journey Settings for the country
      const journeySetting = await OrderJourneySettings.findOne({ 
        country: new RegExp(`^${country}$`, "i") 
      });

      const projectConfigs = [];

      if (journeySetting && journeySetting.journeys && journeySetting.journeys.length > 0) {
        console.log(`Found ${journeySetting.journeys.length} journeys in OrderJourneySettings for ${country}`);
        
        for (const journey of journeySetting.journeys) {
          const pt = journey.projectType;
          const steps = journey.steps || [];
          console.log(`- Journey Project Type: ${pt} with ${steps.length} steps`);

          // Select trigger steps automatically
          let s1Id = "", s2Id = "", s3Id = "", s4Id = "";
          
          if (steps.length >= 4) {
            s1Id = steps[0].id || steps[0].stepId || "";
            s2Id = steps[Math.floor(steps.length * 0.3)].id || steps[Math.floor(steps.length * 0.3)].stepId || "";
            s3Id = steps[Math.floor(steps.length * 0.6)].id || steps[Math.floor(steps.length * 0.6)].stepId || "";
            s4Id = steps[steps.length - 1].id || steps[steps.length - 1].stepId || "";
          } else if (steps.length > 0) {
            s1Id = steps[0].id || steps[0].stepId || "";
            s2Id = (steps[1] || steps[0]).id || (steps[1] || steps[0]).stepId || "";
            s3Id = (steps[2] || steps[1] || steps[0]).id || (steps[2] || steps[1] || steps[0]).stepId || "";
            s4Id = steps[steps.length - 1].id || steps[steps.length - 1].stepId || "";
          }

          projectConfigs.push({
            projectType: pt,
            paymentMode: "PAYMENT_LATER",
            signupToken: {
              tokenType: "fixed",
              fixedAmount: country === "australia" ? 500 : 2000
            },
            paymentStages: [
              {
                stageKey: "stage1",
                label: "Stage 1: Deposit / Booking",
                triggerStepId: s1Id,
                valueType: "percentage",
                defaultValue: 10,
                maxLimit: 15,
                isMandatory: true,
                epcCanEdit: true,
                recipientType: "epc",
                gatewayRequired: true
              },
              {
                stageKey: "stage2",
                label: "Stage 2: Pre-installation",
                triggerStepId: s2Id,
                valueType: "percentage",
                defaultValue: 40,
                maxLimit: 45,
                isMandatory: true,
                epcCanEdit: true,
                recipientType: "epc",
                gatewayRequired: true
              },
              {
                stageKey: "stage3",
                label: "Stage 3: Installation",
                triggerStepId: s3Id,
                valueType: "percentage",
                defaultValue: 40,
                maxLimit: 45,
                isMandatory: true,
                epcCanEdit: true,
                recipientType: "epc",
                gatewayRequired: true
              },
              {
                stageKey: "stage4",
                label: "Stage 4: Completion",
                triggerStepId: s4Id,
                valueType: "percentage",
                defaultValue: 10,
                maxLimit: 15,
                isMandatory: true,
                epcCanEdit: true,
                recipientType: "epc",
                gatewayRequired: true
              }
            ]
          });
          console.log(`  Seeded 4 dynamic stages triggered by steps: [S1: ${s1Id}, S2: ${s2Id}, S3: ${s3Id}, S4: ${s4Id}]`);
        }
      } else {
        console.log(`No journeys found for ${country}. Creating default config.`);
        projectConfigs.push({
          projectType: "Residential",
          paymentMode: "PAYMENT_LATER",
          signupToken: {
            tokenType: "fixed",
            fixedAmount: country === "australia" ? 500 : 2000
          },
          paymentStages: [
            {
              stageKey: "stage1",
              label: "Stage 1: Deposit / Booking",
              triggerStepId: "survey",
              valueType: "percentage",
              defaultValue: 10,
              maxLimit: 15,
              isMandatory: true,
              epcCanEdit: true,
              recipientType: "epc",
              gatewayRequired: true
            },
            {
              stageKey: "stage2",
              label: "Stage 2: Pre-installation",
              triggerStepId: "design",
              valueType: "percentage",
              defaultValue: 40,
              maxLimit: 45,
              isMandatory: true,
              epcCanEdit: true,
              recipientType: "epc",
              gatewayRequired: true
            },
            {
              stageKey: "stage3",
              label: "Stage 3: Installation",
              triggerStepId: "installation",
              valueType: "percentage",
              defaultValue: 40,
              maxLimit: 45,
              isMandatory: true,
              epcCanEdit: true,
              recipientType: "epc",
              gatewayRequired: true
            },
            {
              stageKey: "stage4",
              label: "Stage 4: Completion",
              triggerStepId: "commissioning",
              valueType: "percentage",
              defaultValue: 10,
              maxLimit: 15,
              isMandatory: true,
              epcCanEdit: true,
              recipientType: "epc",
              gatewayRequired: true
            }
          ]
        });
      }

      // 2. Save / Update CustomerPaymentSettings
      let paymentSetting = await CustomerPaymentSettings.findOne({ country });
      if (!paymentSetting) {
        paymentSetting = new CustomerPaymentSettings({
          country,
          projectConfigs
        });
      } else {
        paymentSetting.projectConfigs = projectConfigs;
      }

      await paymentSetting.save();
      console.log(`Successfully saved CustomerPaymentSettings for ${country}.`);
    }

    console.log("\nDatabase seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
