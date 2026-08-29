import('./src/config/db.js').then(async (m) => {
    await m.connectDB();
    const mongoose = (await import('mongoose')).default;
    const Lead = (await import('./src/models/Lead.js')).default;
    const ProjectOrder = (await import('./src/models/ProjectModel.js')).ProjectOrder;
    const EpcEnquiry = mongoose.model('EpcEnquiry', new mongoose.Schema({}, { strict: false }));
    
    const lead = await Lead.findOne({ mobile: '8765432100' });
    const order = await ProjectOrder.findOne({ customerMobile: '8765432100' });
    
    if (lead && order) {
        const enquiryExists = await EpcEnquiry.findOne({ orderNumber: order.orderNumber });
        if (!enquiryExists) {
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
            const mappedType = pTypeMap[order.projectType?.toLowerCase()] || "Residential Solar";

            const enq = new EpcEnquiry({
              customerName: order.customerName,
              customerMobile: order.customerMobile,
              customerEmail: order.customerEmail || "",
              enquiryType: 'ECommerce',
              projectType: mappedType,
              systemCapacityKw: order.systemSizeKW || 1,
              location: order.state ? `${order.location?.district || ''}, ${order.state}, ${order.location?.pincode || ''}` : '',
              state: order.state || 'Unknown',
              district: order.location?.district || order.district || order.state || 'Unknown',
              orderNumber: order.orderNumber,
              preferredInstallDate: order.preferredInstallDate || null,
              status: 'Open For EPC',
              tokenPaid: true,
              tokenPaidAt: new Date(),
              assignmentType: 'FirstComeFirstServe'
            });
            await enq.save();
            console.log('Created missing EpcEnquiry for lamvba!');
        } else {
            console.log('Enquiry already exists');
        }
    } else {
        console.log('Lead or Order not found');
    }
    process.exit(0);
}).catch(console.error);
