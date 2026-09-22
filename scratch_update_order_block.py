import re

with open('Website_Backend/src/controllers/epcOrderController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add KYC block logic
kyc_block = '''    const { stage } = req.body;
    
    // Block order completion if KYC is not Approved
    const restrictedStages = ['Installation In Progress', 'Installation Completed', 'STC Approval', 'Grid Connect Approval', 'Project Closed'];
    if (restrictedStages.includes(stage) && req.epc.onboardingStatus !== 'Approved') {
      return res.status(403).json({ message: 'Please upload your mandatory KYC documents and wait for Admin approval to proceed with the next steps.' });
    }'''

content = content.replace("    const { stage } = req.body;", kyc_block)

with open('Website_Backend/src/controllers/epcOrderController.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated epcOrderController")
