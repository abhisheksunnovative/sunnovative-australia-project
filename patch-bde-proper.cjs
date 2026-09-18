const fs = require('fs');

const bdeControllerPath = 'Website_Backend/src/controllers/bdeController.js';
let content = fs.readFileSync(bdeControllerPath, 'utf8');

const EpcEnquiryImport = `import EpcEnquiry from '../models/EpcEnquiry.js';\n`;
if (!content.includes('import EpcEnquiry')) {
  content = content.replace(/import Lead from '\.\.\/models\/Lead\.js';/, `import Lead from '../models/Lead.js';\n${EpcEnquiryImport}`);
}

const creationLogic = `
    // Also create EpcEnquiry so EPCs can see it in their Demand Pool
    let enquiry = await EpcEnquiry.findOne({ customerMobile: lead.mobile });
    if (!enquiry) {
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
      
      const mappedType = pTypeMap[lead.solarType?.toLowerCase()] || "Residential Solar";
      const kw = parseFloat(lead.kw) || 1;
      
      enquiry = new EpcEnquiry({
        customerName: lead.name,
        customerMobile: lead.mobile,
        customerEmail: lead.email || "",
        enquiryType: 'ECommerce',
        projectType: mappedType,
        systemCapacityKw: kw,
        state: lead.state || "",
        district: lead.district || lead.city || "",
        city: lead.city || lead.district || "",
        address: lead.address || "",
        rooftopPhoto: lead.rooftopPhoto || "",
        preferredInstallDate: lead.preferredInstallDate,
        status: 'Open For EPC',
        assignmentType: 'FirstComeFirstServe'
      });
      await enquiry.save();
    } else if (scheduledDate) {
      // If it exists but date changed
      enquiry.preferredInstallDate = new Date(scheduledDate);
      enquiry.status = 'Open For EPC';
      await enquiry.save();
    }
`;

// Only inject inside scheduleAndQualifyLead
content = content.replace(
  /(\s+action: \`Installation Date Finalized by BDE\`,\s+date: new Date\(\)\s+\}\);\s+await lead\.save\(\);)/,
  `$1\n${creationLogic}`
);

fs.writeFileSync(bdeControllerPath, content);
