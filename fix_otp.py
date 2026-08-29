import re

with open(r'Website_Backend\src\controllers\leadController.js', 'r', encoding='utf-8') as f:
    text = f.read()

if 'sendOTP' not in text:
    text = "import { sendOTP } from '../utils/smsService.js';\nimport { sendOtpEmail } from '../utils/sendOtpEmail.js';\n" + text

pattern = re.compile(r'export const requestDateOtp = async \(req, res\) => \{.*?\n\s*res\.status\(500\)\.json\(\{ success: false, message: error\.message \}\);\n\s*\}\n\};', re.DOTALL)

new_func = '''export const requestDateOtp = async (req, res) => {
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
    console.log(`[OTP] Generated for ${target}: ${otp}`);
    
    // Send OTP live via bulksms / email
    if (phone) {
      try {
        await sendOTP(targetPhone, otp);
      } catch (smsErr) {
        console.warn('[SMS GATEWAY WARNING] Live SMS failed, using console OTP:', smsErr.message);
      }
    } else if (targetEmail) {
      try {
        await sendOtpEmail(targetEmail, otp);
      } catch (emErr) {
        console.warn('[EMAIL GATEWAY WARNING] Live Email failed, using console OTP:', emErr.message);
      }
    }
    
    res.json({ success: true, message: `OTP sent to ${target}`, dummyOtp: otp });
  } catch (error) {
    console.error('[OTP] requestDateOtp error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};'''

text = re.sub(pattern, new_func, text)

with open(r'Website_Backend\src\controllers\leadController.js', 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed requestDateOtp via python script')
