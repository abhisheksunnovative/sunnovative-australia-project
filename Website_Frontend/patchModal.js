import fs from 'fs';

let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

// We will inject the Mobile and Email fields right before the dynamic fields block in the modal
const injectionPoint = /{hasDynamicFields \? \(/;

const newFields = `
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 mb-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-solar-sky focus-within:bg-white transition-all">
                    <div className="px-2.5 py-2 text-xs font-bold text-slate-500 bg-slate-100 border-r border-slate-200 flex shrink-0 items-center gap-1.5">
                      {isAU ? <span className="text-[13px]">🇦🇺</span> : <span className="text-[13px]">🇮🇳</span>}
                      {isAU ? "+61" : "+91"}
                    </div>
                    <input type="tel" required value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\\D/g, ""))} maxLength={isAU ? 9 : 10}
                      placeholder={isAU ? "400 000 000" : "9876543210"}
                      className="w-full px-3 py-2 text-xs text-slate-800 bg-transparent border-none focus:ring-0 outline-none font-medium invalid:[&:not(:placeholder-shown):not(:focus)]:text-red-500" />
                  </div>
                </div>
                {isAU && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Mail className="w-3.5 h-3.5" /></span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-8 pr-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500 invalid:[&:not(:placeholder-shown):not(:focus)]:ring-red-500" />
                  </div>
                </div>
                )}
              </div>
              
              {hasDynamicFields ? (
`;

content = content.replace(injectionPoint, newFields);

// Remove the filter mapping that was attempting to render them later to prevent duplicates
content = content.replace(
  /if \(\!dynamicFields\.find\(f => f\.key === 'email'\)\) dynamicFields\.unshift\(\{ label: 'Email', key: 'email', type: 'email', required: false \}\);\s*if \(\!dynamicFields\.find\(f => f\.key === 'mobileNumber' \|\| f\.key === 'mobile'\)\) dynamicFields\.unshift\(\{ label: 'Mobile Number', key: 'mobileNumber', type: 'tel', required: true \}\);/g,
  ""
);

const contactKeysOld = `const contactKeys = ['mobile', 'email', 'state', 'city', 'postcode', 'district'];`;
const contactKeysNew = `const contactKeys = ['state', 'city', 'postcode', 'district'];`;
content = content.replace(contactKeysOld, contactKeysNew);

fs.writeFileSync('src/components/LeadForm.jsx', content);
console.log("Patched LeadForm.jsx to explicitly render Mobile and Email");
