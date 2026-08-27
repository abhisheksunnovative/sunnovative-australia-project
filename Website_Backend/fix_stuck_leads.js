import mongoose from 'mongoose';
const MONGODB_URI = "mongodb+srv://sunnovative:iMhM2n4Vf8o5Y0xS@cluster0.pif7r.mongodb.net/sunnovativedb?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI).then(async () => {
    const Lead = mongoose.model('Lead', new mongoose.Schema({}, { strict: false }), 'leads');
    const ProjectOrder = mongoose.model('ProjectOrder', new mongoose.Schema({}, { strict: false }), 'projectorders');
    const EpcEnquiry = mongoose.model('EpcEnquiry', new mongoose.Schema({}, { strict: false }), 'epcenquiries');

    // 1. Convert any leads that have ProjectOrders but are still marked as non-converted
    const projects = await ProjectOrder.find();
    for (let po of projects) {
        if (!po.customerMobile) continue;
        const lead = await Lead.findOne({ mobile: po.customerMobile });
        if (lead && (!lead.convertedProjectId || lead.status !== 'Converted')) {
            await Lead.updateOne({ _id: lead._id }, { 
                $set: { 
                    convertedProjectId: po._id, 
                    status: 'Converted', 
                    tokenPaid: true 
                } 
            });
            console.log(`Converted lead ${lead.mobile} -> ${po.orderNumber}`);
        }

        // 2. Ensure EpcEnquiry exists for this project if EPC is assigned
        if (po.assignedEPCId) {
            let eq = await EpcEnquiry.findOne({ orderNumber: po.orderNumber });
            if (!eq) {
                await EpcEnquiry.create({
                    customerName: po.customerName,
                    customerMobile: po.customerMobile,
                    customerEmail: po.customerEmail || "",
                    enquiryType: 'ECommerce',
                    projectType: po.projectType,
                    systemCapacityKw: po.systemSizeKW || 1,
                    location: po.state ? `${po.location?.district || ''}, ${po.state}, ${po.location?.pincode || ''}` : '',
                    state: po.state,
                    district: po.location?.district || '',
                    city: po.location?.district || '',
                    orderNumber: po.orderNumber,
                    status: 'EPC Accepted',
                    assignedEPCId: po.assignedEPCId,
                    assignedEPCName: po.assignedEPCName || "Unknown"
                });
                console.log(`Created EpcEnquiry for ${po.orderNumber}`);
            }
        }
    }
    
    console.log("Done!");
    process.exit(0);
});
