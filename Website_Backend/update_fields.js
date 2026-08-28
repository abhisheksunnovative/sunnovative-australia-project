
import mongoose from 'mongoose';
import { WebsiteSettings } from './src/models/WebsiteSettings.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sunnovative').then(async () => {
    const settings = await WebsiteSettings.find({});
    for (let s of settings) {
        if (!s.projectForm.fields.find(f => f.key === 'tariffDesc')) {
            s.projectForm.fields.push({ label: 'Tariff', key: 'tariffDesc', type: 'text', required: false, options: [] });
            s.projectForm.fields.push({ label: 'Meter Category', key: 'meterCategory', type: 'text', required: false, options: [] });
            s.projectForm.fields.push({ label: 'Discom / Retailer', key: 'discom', type: 'text', required: false, options: [] });
            await s.save();
        }
    }
    console.log('Updated');
    process.exit(0);
});
