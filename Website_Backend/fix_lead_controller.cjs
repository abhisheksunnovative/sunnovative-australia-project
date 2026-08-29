const fs = require('fs');
let text = fs.readFileSync('Website_Backend/src/controllers/leadController.js', 'utf-8');

const oldFunc = `export const requestDateOtp = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    const { email } = req.body;
    if (!email && !lead.email) return res.status(400).json({ success: false, message: 'Customer email is required' });
    const targetEmail = email || lead.email;
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    lead.email = targetEmail; 
    lead.installDateOtp = otp;
    lead.installDateOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await lead.save();
    console.log(\`[OTP] Generated for \${targetEmail}: \${otp}\`);
    res.json({ success: true, message: 'OTP sent to customer email', dummyOtp: otp });
  } catch (error) {`;

const newFunc = `export const requestDateOtp = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    const { email, phone } = req.body;
    
    const targetEmail = email || lead.email;
    const targetPhone = phone || lead.mobile;
    
    if (!targetEmail && !targetPhone) return res.status(400).json({ success: false, message: 'Customer email or phone is required' });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    if (phone) lead.mobile = targetPhone;
    if (email) lead.email = targetEmail; 
    
    lead.installDateOtp = otp;
    lead.installDateOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await lead.save();
    
    const target = phone ? targetPhone : targetEmail;
    console.log(\`[OTP] Generated for \${target}: \${otp}\`);
    res.json({ success: true, message: \`OTP sent to \${target}\`, dummyOtp: otp });
  } catch (error) {`;

text = text.replace(oldFunc, newFunc);
fs.writeFileSync('Website_Backend/src/controllers/leadController.js', text);
console.log('Fixed backend leadController');
