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

router.get('/fix-stuck-leads', async (req, res) => {
    try {
        const Lead = (await import('../models/Lead.js')).default;
        const ProjectOrder = (await import('../models/ProjectModel.js')).ProjectOrder;
        const EpcEnquiry = (await import('../models/EpcEnquiry.js')).default;

        const projects = await ProjectOrder.find();
        let logs = [];
        for (let po of projects) {
            if (!po.customerMobile) continue;
            const lead = await Lead.findOne({ mobile: po.customerMobile });
            if (lead && (!lead.convertedProjectId || lead.status !== 'Converted')) {
                lead.convertedProjectId = po._id;
                lead.status = 'Converted';
                lead.tokenPaid = true;
                await lead.save();
                logs.push(`Converted lead ${lead.mobile} -> ${po.orderNumber}`);
            }

            let eq = await EpcEnquiry.findOne({ orderNumber: po.orderNumber });
            if (!eq) {
                const pTypeMap = {
                  "surya-ghar": "Surya Ghar Yojana",
                  "residential": "Residential Solar",
                  "commercial": "Commercial Solar",
                  "group": "Group Solar",
                  "au-small-home": "AU Small Home (6.6kW)",
                  "au-standard-family": "AU Standard Family (8-10kW)",
                  "au-large-home": "AU Large Home (10-13kW)",
                  "au-ev-owners": "AU EV Owners (13-20kW)",
                  "au-solar-battery": "AU Solar + Battery"
                };
                const mappedType = pTypeMap[po.projectType?.toLowerCase()] || "Residential Solar";

                let enquiryData = {
                    customerName: po.customerName,
                    customerMobile: po.customerMobile,
                    customerEmail: po.customerEmail || "",
                    enquiryType: 'ECommerce',
                    projectType: mappedType,
                    systemCapacityKw: po.systemSizeKW || 1,
                    location: po.state ? `${po.location?.district || ''}, ${po.state}, ${po.location?.pincode || ''}` : '',
                    state: po.state || 'Unknown',
                    district: po.location?.district || po.state || 'Unknown',
                    city: po.location?.district || po.state || 'Unknown',
                    orderNumber: po.orderNumber,
                    status: 'Open For EPC'
                };
                
                if (po.assignedEPCId) {
                    enquiryData.epcPartner = po.assignedEPCId;
                    enquiryData.assignedEPCName = po.assignedEPCName || "Unknown";
                    enquiryData.status = 'EPC Accepted';
                }

                await EpcEnquiry.create(enquiryData);
                logs.push(`Created EpcEnquiry for ${po.orderNumber} (FCFS: ${!po.assignedEPCId})`);
            }
        }
        res.json({ success: true, logs });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/fix-epc-enquiries', async (req, res) => {
    try {
        const EpcEnquiry = (await import('../models/EpcEnquiry.js')).default;
        
        let logs = [];
        // Fix status "Open" to "Open For EPC"
        let updatedOpen = await EpcEnquiry.updateMany({ status: 'Open' }, { $set: { status: 'Open For EPC' } });
        logs.push(`Fixed ${updatedOpen.modifiedCount} enquiries with status 'Open'`);

        // Fix missing epcPartner
        const enquiries = await EpcEnquiry.find({ assignedEPCId: { $exists: true } });
        for (let eq of enquiries) {
            eq.epcPartner = eq._doc.assignedEPCId;
            eq._doc.assignedEPCId = undefined; // unset
            await eq.save();
            logs.push(`Fixed epcPartner for ${eq.orderNumber}`);
        }
        
        // Remove assignedEPCId from DB
        await EpcEnquiry.updateMany({}, { $unset: { assignedEPCId: "" } }, { strict: false });
        
        res.json({ success: true, logs });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/check-epcs', async (req, res) => {
    try {
        const EpcPartner = (await import('../models/EpcPartner.js')).default;
        const epcs = await EpcPartner.find({ state: 'Gujarat' }, 'companyName trustBadge.status');
        res.json(epcs);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/check-journey', async (req, res) => {
    try {
        const mongoose = (await import('mongoose')).default;
        const db = mongoose.connection.db;
        const settings = await db.collection('orderjourneysettings').findOne({ country: 'india' });
        const data = settings.journeys.map(j => ({ type: j.projectType, selection: j.epcSelectionType }));
        res.json(data);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/check-enquiry/:orderNumber', async (req, res) => {
    try {
        const EpcEnquiry = (await import('../models/EpcEnquiry.js')).default;
        const ProjectOrder = (await import('../models/ProjectModel.js')).ProjectOrder;
        
        const enq = await EpcEnquiry.findOne({ orderNumber: req.params.orderNumber });
        const po = await ProjectOrder.findOne({ orderNumber: req.params.orderNumber });
        
        res.json({ enquiry: enq, project: po });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/revert-leads', async (req, res) => {
    try {
        const Lead = (await import('../models/Lead.js')).default;
        
        let logs = [];
        // Find leads that are converted but lack an EPC
        const leads = await Lead.find({ status: 'Converted' });
        for (let lead of leads) {
            if (!lead.assignedEpc && !lead.assignedEPCName && !lead.assignedEPCId) {
                lead.status = 'Contacted';
                lead.convertedProjectId = null;
                await lead.save();
                logs.push(`Reverted lead ${lead.mobile}`);
            }
        }
        res.json({ success: true, logs });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/check-error/:enquiryId/:epcId', async (req, res) => {
    try {
        const EpcEnquiry = (await import('../models/EpcEnquiry.js')).default;
        const EpcPartner = (await import('../models/EpcPartner.js')).default;
        
        const enq = await EpcEnquiry.findById(req.params.enquiryId);
        const epc = await EpcPartner.findById(req.params.epcId);
        
        res.json({ enquiry: enq?.status, wallet: epc?.walletBalance, points: epc?.points, country: epc?.country });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/check-wallet/:epcId', async (req, res) => {
    try {
        const EpcWallet = (await import('../models/EpcWallet.js')).default;
        const wallet = await EpcWallet.findOne({ epcPartner: req.params.epcId });
        res.json({ wallet });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/add-credits', async (req, res) => {
    try {
        const EpcWallet = (await import('../models/EpcWallet.js')).default;
        const wallet = await EpcWallet.findOne({ epcPartner: '6a4735a23d0799d446107f94' }); // Test Solar
        if (wallet) {
            // Map Surya Ghar to Residential Solar
            for (let c of wallet.credits) {
                if (c.projectType === 'Surya Ghar Yojana') {
                    c.projectType = 'Residential Solar';
                }
                c.district = 'All'; // So it can be used universally
            }
            // Consolidate
            let newCredits = {};
            for (let c of wallet.credits) {
                newCredits[c.projectType] = (newCredits[c.projectType] || 0) + c.credits;
            }
            wallet.credits = Object.keys(newCredits).map(k => ({ district: 'All', projectType: k, credits: newCredits[k] }));
            
            // Add 100 extra just in case
            let resEntry = wallet.credits.find(c => c.projectType === 'Residential Solar');
            if (!resEntry) {
                wallet.credits.push({ district: 'All', projectType: 'Residential Solar', credits: 100 });
            } else {
                resEntry.credits += 100;
            }

            await wallet.save();
        }
        res.json({ success: true, message: 'Mapped Surya Ghar to Residential Solar and fixed district to All' });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/fix-date/:orderNumber', async (req, res) => {
    try {
        const EpcEnquiry = (await import('../models/EpcEnquiry.js')).default;
        const ProjectOrder = (await import('../models/ProjectModel.js')).ProjectOrder;
        
        const po = await ProjectOrder.findOne({ orderNumber: req.params.orderNumber });
        const eq = await EpcEnquiry.findOne({ orderNumber: req.params.orderNumber });
        if (po && eq && po.preferredInstallDate) {
            eq.preferredInstallDate = po.preferredInstallDate;
            await eq.save();
        }
        res.json({ success: true, date: eq.preferredInstallDate });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/clean-projects', async (req, res) => {
    try {
        const ProjectOrder = (await import('../models/ProjectModel.js')).ProjectOrder;
        const Lead = (await import('../models/Lead.js')).default;
        const EpcEnquiry = (await import('../models/EpcEnquiry.js')).default;

        // 1. Delete "Starter Solar" completely
        await ProjectOrder.deleteMany({ $or: [{ projectType: 'Starter Solar' }, { projectTypeLabel: 'Starter Solar' }] });
        await Lead.deleteMany({ $or: [{ projectType: 'Starter Solar' }, { projectTypeLabel: 'Starter Solar' }] });

        // 2. Map 'residential' to standard Residential Solar labels
        await ProjectOrder.updateMany(
            { $or: [{ projectType: 'residential' }, { projectTypeLabel: /residential/i }] },
            { $set: { projectType: 'residential', projectTypeLabel: 'Residential Solar' } },
            { runValidators: false }
        );
        await Lead.updateMany(
            { $or: [{ projectType: 'residential' }, { projectTypeLabel: /residential/i }] },
            { $set: { projectType: 'residential', projectTypeLabel: 'Residential Solar' } }
        );

        res.json({ success: true, message: 'Cleaned and mapped project types correctly.' });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
