const fs = require('fs');
const path = 'Website_Admin/src/components/bde/BDEProspects.jsx';
let text = fs.readFileSync(path, 'utf8');

const old_send = `  const sendOtp = async () => {
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

const new_send = `  const sendOtp = async () => {
    const isIndia = country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in';
    if (isIndia && !customerPhone) return alert("Phone number required for Indian customers");
    if (!isIndia && !customerEmail) return alert("Email required");
    
    setIsOtpLoading(true);
    console.log(\`[OTP-UI] Sending OTP for lead: \${otpModalLead?._id}, target: \${isIndia ? customerPhone : customerEmail}\`);
    try {
      const token = localStorage.getItem('token');
      const payload = isIndia ? { phone: customerPhone } : { email: customerEmail };
      const res = await fetch(\`\${API_BASE}/api/leads/\${otpModalLead._id}/request-date-otp\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
        body: JSON.stringify(payload)
      });`;

text = text.replace(old_send, new_send);

// Now the UI modal changes
const old_ui = `                  <p className="text-sm text-slate-500 mb-4">
                    Please confirm the customer's email address to send the verification OTP.
                  </p>
                  
                  <div className="mb-4 text-left">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer Email</label>
                    <input 
                      type="email" 
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendOtp()}
                    />
                  </div>`;

const new_ui = `                  <p className="text-sm text-slate-500 mb-4">
                    {country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in' ? 
                      "Please confirm the customer's phone number to send the verification OTP." : 
                      "Please confirm the customer's email address to send the verification OTP."}
                  </p>
                  
                  <div className="mb-4 text-left">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      {country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in' ? 'Customer Phone' : 'Customer Email'}
                    </label>
                    {country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in' ? (
                      <input 
                        type="tel" 
                        className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendOtp()}
                      />
                    ) : (
                      <input 
                        type="email" 
                        className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendOtp()}
                      />
                    )}
                  </div>`;

text = text.replace(old_ui, new_ui);

const old_button = `disabled={isOtpLoading || !customerEmail}`;
const new_button = `disabled={isOtpLoading || ((country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in') ? !customerPhone : !customerEmail)}`;
text = text.replace(old_button, new_button);

const old_sent_msg = `OTP sent to <strong>{customerEmail}</strong>`;
const new_sent_msg = `OTP sent to <strong>{(country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in') ? customerPhone : customerEmail}</strong>`;
text = text.replace(old_sent_msg, new_sent_msg);

fs.writeFileSync(path, text);
console.log("Done");
