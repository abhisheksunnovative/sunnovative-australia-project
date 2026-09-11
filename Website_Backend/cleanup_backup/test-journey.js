import mongoose from 'mongoose';
import { OrderJourneySettings } from './src/models/OrderJourneySettings.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const settings = await OrderJourneySettings.findOne({ country: 'india' });
  const resJourney = settings.journeys.find(j => j.projectType === 'residential');
  console.log("Residential Journey Description:", resJourney.description);
  console.log("First step title:", resJourney.steps[0].title);
  process.exit();
}).catch(console.error);
