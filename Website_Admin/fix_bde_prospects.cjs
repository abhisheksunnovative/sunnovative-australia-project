const fs = require('fs');
let text = fs.readFileSync('Website_Admin/src/components/bde/BDEProspects.jsx', 'utf-8');

text = text.replace(
  "setCustomerEmail(lead.email || '');\n    setOtpSent(false);",
  "setCustomerEmail(lead.email || '');\n    setCustomerPhone(lead.mobile || '');\n    setOtpSent(false);"
);

const oldSendOtp = `  const sendOtp = async () => {
    if (!customerEmail) return alert("Email required");
    setIsOtpLoading(true);
    console.log(\`[OTP-UI] Sending OTP for lead: \${otpModalLead?._id}, email: \${customerEmail}\`);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(\`\${API_BASE}/api/leads/\${otpModalLead._id}/request-date-otp\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
        body: JSON.stringify({ email: customerEmail })
      });`;

const newSendOtp = `  const sendOtp = async () => {
    const isIndia = (country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in');
    if (isIndia && !customerPhone) return alert("Phone number required");
    if (!isIndia && !customerEmail) return alert("Email required");
    
    setIsOtpLoading(true);
    const targetPayload = isIndia ? { phone: customerPhone } : { email: customerEmail };
    console.log(\`[OTP-UI] Sending OTP for lead: \${otpModalLead?._id}, \${isIndia ? 'phone' : 'email'}: \${isIndia ? customerPhone : customerEmail}\`);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(\`\${API_BASE}/api/leads/\${otpModalLead._id}/request-date-otp\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
        body: JSON.stringify(targetPayload)
      });`;

text = text.replace(oldSendOtp, newSendOtp);
fs.writeFileSync('Website_Admin/src/components/bde/BDEProspects.jsx', text);
console.log('Fixed BDEProspects.jsx');
