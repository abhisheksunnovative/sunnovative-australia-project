with open('Website_Frontend/src/components/LeadForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find the start and end of the modal form body to replace it
start_marker = '{/* RE-INSERTED CONTACT FIELDS */}'
end_marker = '<div className="pt-4 border-t border-slate-100 mt-6 sticky bottom-0 bg-white pb-2">'
start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_modal_body = '''
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all" />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number *</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-solar-sky focus-within:bg-white transition-all">
                      <div className="px-2.5 py-2 text-xs font-bold text-slate-500 bg-slate-100 border-r border-slate-200 flex shrink-0 items-center gap-1.5">
                        {isAU ? "+61" : "+91"}
                      </div>
                      <input type="tel" required value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))} maxLength={isAU ? 9 : 10} placeholder={isAU ? "400 000 000" : "9876543210"} className="w-full px-3 py-2 text-xs text-slate-800 bg-transparent border-none focus:ring-0 outline-none font-medium" />
                    </div>
                  </div>

                  {(!country || country !== "IN") && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address *</label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all" />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">State *</label>
                    <select required value={customerState} onChange={(e) => setCustomerState(e.target.value)} className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer font-medium">
                      <option value="">Select State</option>
                      {(countryStatesMap[country] || countryStatesMap["IN"]).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAU ? "Suburb / City *" : "City *"}</label>
                    <input type="text" required value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city" className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode / Postcode *</label>
                    <input type="text" required value={postcode} onChange={e => setPostcode(e.target.value.replace(/\D/g, ""))} placeholder="Enter postcode" className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all" />
                  </div>
                </div>
                
                '''
    content = content[:start_idx] + new_modal_body + content[end_idx:]
    with open('Website_Frontend/src/components/LeadForm.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Modal updated successfully!")
else:
    print("Markers not found.")
