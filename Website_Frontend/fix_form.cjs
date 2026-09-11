const fs = require('fs');
const path = 'src/components/LeadForm.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-solar-sky focus-within:bg-white transition-all">
                    <div className="px-2.5 py-2 text-xs font-bold text-slate-500 bg-slate-100 border-r border-slate-200 flex shrink-0 items-center gap-1.5">
                      {isAU ? <span className="text-[13px]">🇦🇺</span> : <span className="text-[13px]">🇮🇳</span>}
                      {isAU ? "+61" : "+91"}
                    </div>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\\D/g, ""))} maxLength={isAU ? 9 : 10}
                      placeholder={isAU ? "400 000 000" : "9876543210"}
                      className="w-full px-3 py-2 text-xs text-slate-800 bg-transparent border-none focus:ring-0 outline-none font-medium invalid:[&:not(:placeholder-shown):not(:focus)]:text-red-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Mail className="w-3.5 h-3.5" /></span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-8 pr-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500 invalid:[&:not(:placeholder-shown):not(:focus)]:ring-red-500" />
                  </div>
                </div>
              </div>`;

const replacement = `              <div className={\`grid grid-cols-1 \${isAU ? 'md:grid-cols-2' : ''} gap-3\`}>
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
              </div>`;

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log("Successfully fixed phone reference and conditionally hid email for India fallback.");
} else {
    console.log("Target block not found precisely. Let's try regex or split.");
}

