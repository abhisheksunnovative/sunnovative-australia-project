const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  const Country = require('./src/models/Country.js').default;
  
  const countries = await Country.find();
  console.log('Countries:', countries.map(c => ({ name: c.name, isActive: c.isActive })));
  
  process.exit(0);
}
run();
