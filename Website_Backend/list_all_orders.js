import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const MONGO_URI = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/sunnovative_ecommerce";

async function run() {
  await mongoose.connect(MONGO_URI);
  const ProjectOrder = mongoose.model("ProjectOrder", new mongoose.Schema({}, { strict: false }));

  const orders = await ProjectOrder.find({}).lean();
  console.log(`Total orders found: ${orders.length}`);
  for (const o of orders) {
    console.log(`- ID: ${o._id}, Name: ${o.customerName}, OrderNum: ${o.orderNumber}, Country: ${o.country}, Steps Count: ${o.steps?.length}`);
    if (o.steps && o.steps[0]) {
      console.log(`  First Step: ID=${o.steps[0].stepId}, Title="${o.steps[0].title}", Desc="${o.steps[0].description}"`);
    }
  }

  process.exit(0);
}

run().catch(console.error);
