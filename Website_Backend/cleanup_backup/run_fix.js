import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import mongoose from 'mongoose';
import Lead from './src/models/Lead.js';
import { attemptAutoConversion } from './src/controllers/leadController.js';

mongoose.connect(process.env.MONGODB_URL).then(async () => {
    const leads = await Lead.find({
        status: { $ne: 'Converted' },
        $or: [
            { assignedEpc: { $exists: true, $ne: null } },
            { assignedEPCName: { $exists: true, $ne: null } }
        ],
        $or: [
            { isInstallDateFixed: true },
            { preferredInstallDate: { $exists: true, $ne: null } }
        ]
    });
    
    for (const lead of leads) {
        if (lead.convertedProjectId) {
            lead.status = 'Converted';
            lead.bdeMovedToOrderJourney = true;
            await lead.save();
            console.log('Fixed lead (updated status):', lead.name);
        } else {
            console.log('Lead needs /convert call:', lead.name);
            await attemptAutoConversion(lead);
        }
    }
    
    console.log('Done fixing existing leads');
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
