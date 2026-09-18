const fs = require('fs'); 
let code = fs.readFileSync('src/controllers/leadController.js', 'utf8'); 
const oldCode = 'res.status(201).json({ success: true, data: lead });'; 
const newCode = `    try {
      const { default: Notification } = await import('../models/Notification.js');
      await Notification.create({
        role: 'Admin',
        title: 'New Website Enquiry',
        message: \`A new lead has been received from \${name.trim()} (\${resolvedMobile.trim()}).\`,
        leadId: lead._id,
        type: 'lead_update'
      });

      const { BDE } = await import('../models/BDEModel.js');
      const matchingBdes = await BDE.find({
        isActive: true,
        $or: [
          { assignedDistricts: { $regex: new RegExp(\`^\${district || '____'}\`, 'i') } },
          { assignedStates: { $regex: new RegExp(\`^\${state || '____'}\`, 'i') } }
        ]
      });

      for (const bde of matchingBdes) {
        await Notification.create({
          role: 'BDE',
          recipientId: bde._id,
          title: 'New Lead in Demand Pool',
          message: \`A new lead (\${name.trim()}) from your area (\${district || city}, \${state}) is now in the Demand Pool.\`,
          leadId: lead._id,
          type: 'lead_update',
          relatedTab: 'bde-demand'
        });
      }
    } catch (notifErr) {
      console.error('Failed to send lead notifications:', notifErr);
    }
    res.status(201).json({ success: true, data: lead });`; 
code = code.replace(oldCode, newCode); 
fs.writeFileSync('src/controllers/leadController.js', code);
