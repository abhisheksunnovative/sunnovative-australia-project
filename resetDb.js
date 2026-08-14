import mongoose from 'mongoose';
import { OrderJourneySettings } from './Website_Backend/src/models/OrderJourneySettings.js';
import { ProjectOrder } from './Website_Backend/src/models/ProjectModel.js';
import { seedData } from './Website_Backend/src/controllers/orderJourneySettingsController.js';

const URI = 'mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP';

const run = async () => {
    await mongoose.connect(URI);
    console.log('Connected to DB');
    
    await OrderJourneySettings.deleteMany({});
    console.log('Wiped settings');

    for (const [countryKey, journeysArray] of Object.entries(seedData)) {
        await OrderJourneySettings.create({
            country: countryKey,
            state: 'all',
            district: 'all',
            discom: 'all',
            journeys: journeysArray
        });
        console.log('Seeded ' + countryKey);

        for (const j of journeysArray) {
            const activeProjects = await ProjectOrder.find({
                projectType: j.projectType,
                status: { $nin: ['completed', 'cancelled'] }
            });

            for (const order of activeProjects) {
                let updated = false;
                order.steps = order.steps.map(step => {
                    const masterStep = j.steps.find(s => s.id === step.stepId);
                    if (masterStep) {
                        if (step.status === 'in-progress' || step.status === 'pending' || step.status === 'awaiting-approval') {
                            step.requiredActions = masterStep.requiredActions || [];
                            step.description = masterStep.description || "";
                            updated = true;
                        }
                    }
                    return step;
                });
                if (updated) {
                    await order.save();
                    console.log('Updated order ' + order.orderNumber);
                }
            }
        }
    }
    console.log('Done');
    process.exit(0);
};
run().catch(console.error);
