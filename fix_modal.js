const fs = require('fs');
const path = 'Website_Admin/src/components/bde/BDEProspects.jsx';
let text = fs.readFileSync(path, 'utf8');

// 1. Update handleRequestOtp
const oldHandleRequest = `  const handleRequestOtp = async (lead) => {
    setOtpModalLead(lead);
    setCustomerEmail(lead.email || '');
    setOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpValue('');
  };`;
const newHandleRequest = `  const handleRequestOtp = async (lead) => {
    setOtpModalLead(lead);
    setCustomerEmail(lead.email || '');
    setCustomerPhone(lead.phone || '');
    setOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpValue('');
  };`;
text = text.replace(oldHandleRequest, newHandleRequest);

// 2. Update UI Block
const oldUIBlock = `              {!otpSent ? (
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Customer Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input 
                      autoFocus
                      type="email" 
                      value={customerEmail} 
                      onChange={e => setCustomerEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendOtp()}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                      placeholder="customer@email.com"
                    />
                  </div>`;

const newUIBlock = `              {!otpSent ? (
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    {(country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in') ? 'Customer Phone' : 'Customer Email'}
                  </label>
                  <div className="relative">
                    {(country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in') ? (
                      <PhoneCall className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    ) : (
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    )}
                    {(country?.toLowerCase() === 'india' || country?.toLowerCase() === 'in') ? (
                      <input 
                        autoFocus
                        type="tel" 
                        value={customerPhone} 
                        onChange={e => setCustomerPhone(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendOtp()}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                        placeholder="Customer Mobile Number"
                      />
                    ) : (
                      <input 
                        autoFocus
                        type="email" 
                        value={customerEmail} 
                        onChange={e => setCustomerEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendOtp()}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                        placeholder="customer@email.com"
                      />
                    )}
                  </div>`;
text = text.replace(oldUIBlock, newUIBlock);

fs.writeFileSync(path, text);
console.log("Done");
