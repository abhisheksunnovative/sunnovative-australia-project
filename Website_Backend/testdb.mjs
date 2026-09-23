import mongoose from 'mongoose';
import { BillTemplate } from './src/models/BillTemplate.js';

mongoose.connect('mongodb://127.0.0.1:27017/sunnovative-b2b').then(async () => {
  const t = await BillTemplate.findOne({ discomName: 'Origin Energy' });
  if(t) {
    console.log('RULES:', t.extractionRules.map(r => r.field));
  } else {
    console.log('Not found');
  }
  mongoose.disconnect();
});
