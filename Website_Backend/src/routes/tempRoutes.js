import express from 'express';
import { ProjectOrder } from '../models/ProjectModel.js';
import { OrderJourneySettings } from '../models/OrderJourneySettings.js';

const router = express.Router();

router.get('/fix-orders', async (req, res) => {
    try {
        const settings = await OrderJourneySettings.find();
        let updatedCount = 0;
        
        for (const setting of settings) {
            for (const journey of setting.journeys) {
                const activeProjects = await ProjectOrder.find({
                    projectType: journey.projectType,
                    status: { $nin: ['Project Completed', 'cancelled', 'closed', 'Warranty Activated'] }
                });

                for (const order of activeProjects) {
                    let updated = false;
                    order.steps = order.steps.map(step => {
                        const masterStep = journey.steps.find(s => s.id === step.stepId);
                        if (masterStep) {
                            if (step.status === 'in-progress' || step.status === 'pending' || step.status === 'awaiting-approval') {
                                if (JSON.stringify(step.requiredActions) !== JSON.stringify(masterStep.requiredActions)) {
                                    step.requiredActions = masterStep.requiredActions || [];
                                    step.description = masterStep.description || '';
                                    updated = true;
                                }
                            }
                        }
                        return step;
                    });
                    if (updated) {
                        await order.save();
                        updatedCount++;
                    }
                }
            }
        }
        res.json({ success: true, message: 'Updated ' + updatedCount + ' orders' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
