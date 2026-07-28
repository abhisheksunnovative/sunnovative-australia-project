import mongoose from 'mongoose';
import { WebsiteSettings } from './src/models/WebsiteSettings.js';
import { getWebsiteSettings } from './src/controllers/websiteSettingsController.js';

mongoose.connect('mongodb://127.0.0.1:27017/sunnovative').then(async () => {
  try {
    const req = { country: 'in' };
    const res = {
      json: (d) => console.log('JSON:', d),
      status: (c) => ({
        json: (d) => console.log('STATUS', c, d)
      })
    };
    await getWebsiteSettings(req, res);
  } catch(e) {
    console.error('ERROR:', e);
  }
  process.exit(0);
});
