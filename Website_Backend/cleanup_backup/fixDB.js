import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const ProjectSchema = new mongoose.Schema({
    state: String,
    district: String,
    location: {
        state: String,
        district: String,
        city: String
    }
}, { strict: false });
const ProjectOrder = mongoose.model('ProjectOrder', ProjectSchema, 'projectorders');

async function fix() {
    await mongoose.connect(process.env.MONGODB_URL);
    const projects = await ProjectOrder.find();
    let updated = 0;
    
    for (const p of projects) {
        let changed = false;
        
        let currentState = p.state || (p.location && p.location.state) || 'Gujarat';
        let currentDistrict = p.district || (p.location && p.location.district) || '';
        
        if (!currentDistrict || currentDistrict === 'Unknown') {
            if (currentState.toLowerCase() === 'gujarat') currentDistrict = 'Ahmedabad';
            else if (currentState.toLowerCase().includes('maharashtra')) currentDistrict = 'Mumbai';
            else if (currentState.toLowerCase().includes('victoria')) currentDistrict = 'Melbourne';
            else if (currentState.toLowerCase().includes('wales')) currentDistrict = 'Sydney';
            else if (currentState.toLowerCase().includes('queensland')) currentDistrict = 'Brisbane';
            else currentDistrict = 'Capital City'; 
            
            p.district = currentDistrict;
            if (!p.location) p.location = {};
            p.location.district = currentDistrict;
            p.location.state = currentState;
            
            p.markModified('location');
            changed = true;
        }
        
        if (changed) {
            await p.save();
            updated++;
        }
    }
    console.log(`Updated ${updated} projects`);
    process.exit(0);
}
fix();
