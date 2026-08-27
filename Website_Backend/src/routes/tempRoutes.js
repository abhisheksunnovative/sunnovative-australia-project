import express from 'express';
import { ProjectOrder } from '../models/ProjectModel.js';
import { OrderJourneySettings } from '../models/OrderJourneySettings.js';
import EpcEnquiry from '../models/EpcEnquiry.js';

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
router.get('/check-leads-epc', async (req, res) => {
    try {
        const Lead = (await import('../models/Lead.js')).default;
        const leads = await Lead.find({ mobile: { $in: ['9000999976', '9999997777'] } });
        res.json(leads.map(l => ({ 
            mobile: l.mobile, 
            assignedEPCName: l.assignedEPCName,
            assignedEPCId: l.assignedEPCId,
            assignedEpc: l.assignedEpc
        })));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/fix-lead-token', async (req, res) => {
    try {
        const Lead = (await import('../models/Lead.js')).default;
        const EpcEnquiry = (await import('../models/EpcEnquiry.js')).default;
        
        const enquiries = await EpcEnquiry.find({ tokenPaid: true });
        let count = 0;
        for (let enq of enquiries) {
            const lead = await Lead.findOne({ mobile: enq.customerMobile });
            if (lead && !lead.tokenPaid) {
                lead.tokenPaid = true;
                await lead.save();
                count++;
            }
        }
        res.json({ success: true, fixed: count });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/fix-assigned-bde', async (req, res) => {
    try {
        const ProjectOrder = (await import('../models/ProjectModel.js')).ProjectOrder;
        const Lead = (await import('../models/Lead.js')).default;
        
        const projects = await ProjectOrder.find({ assignedBde: null });
        let count = 0;
        for (let p of projects) {
            if (p.leadId) {
                const lead = await Lead.findById(p.leadId);
                if (lead && lead.assignedBde) {
                    p.assignedBde = lead.assignedBde;
                    await p.save();
                    count++;
                }
            } else {
                const lead = await Lead.findOne({ convertedProjectId: p._id });
                if (lead && lead.assignedBde) {
                    p.leadId = lead._id;
                    p.assignedBde = lead.assignedBde;
                    await p.save();
                    count++;
                }
            }
        }
        res.json({ success: true, count });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
