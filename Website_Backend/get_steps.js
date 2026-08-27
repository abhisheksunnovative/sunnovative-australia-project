import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://sunnovative:iMhM2n4Vf8o5Y0xS@cluster0.pif7r.mongodb.net/sunnovativedb?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const OrderJourneySettings = mongoose.model('OrderJourneySettings', new mongoose.Schema({}, { strict: false }), 'orderjourneysettings');
    const settings = await OrderJourneySettings.findOne({ country: 'india' });
    const journey = settings.journeys.find(j => j.projectType === 'residential');
    console.log(journey.steps.map(s => s.title));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
