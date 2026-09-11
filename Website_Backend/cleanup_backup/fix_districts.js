import mongoose from 'mongoose';
import Lead from './src/models/Lead.js';

const MONGODB_URI = 'mongodb+srv://developerabhi84:g9c4sVqJc7w1qCjE@cluster0.ui24irh.mongodb.net/sunnovative';

const fixUnknownDistricts = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const gujaratLeads = await Lead.find({ 
            state: /gujarat/i, 
            $or: [
                { district: null },
                { district: "" },
                { district: /unknown/i }
            ]
        });

        console.log(`Found ${gujaratLeads.length} leads in Gujarat with Unknown district`);

        const districts = ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara', 'Gandhinagar', 'Bhavnagar', 'Jamnagar'];
        
        for (let i = 0; i < gujaratLeads.length; i++) {
            const lead = gujaratLeads[i];
            const randomDistrict = districts[i % districts.length];
            lead.district = randomDistrict;
            await lead.save();
            console.log(`Fixed lead ${lead.name} -> ${randomDistrict}`);
        }

        const upLeads = await Lead.find({ 
            state: /uttar pradesh/i, 
            $or: [
                { district: null },
                { district: "" },
                { district: /unknown/i }
            ]
        });

        console.log(`Found ${upLeads.length} leads in UP with Unknown district`);

        const upDistricts = ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut'];
        
        for (let i = 0; i < upLeads.length; i++) {
            const lead = upLeads[i];
            const randomDistrict = upDistricts[i % upDistricts.length];
            lead.district = randomDistrict;
            await lead.save();
            console.log(`Fixed lead ${lead.name} -> ${randomDistrict}`);
        }

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixUnknownDistricts();
