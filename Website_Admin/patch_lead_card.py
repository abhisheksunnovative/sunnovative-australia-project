import re

with open("src/components/bde/BDELeadManagement.jsx", "r", encoding="utf8") as f:
    content = f.read()

# 1. Align Email below Mobile
email_regex = r'\{lead\.email && <span className="ml-1 px-2 py-0\.5 bg-slate-100 text-slate-500 rounded-md text-\[11px\] border border-slate-200">\{lead\.email\}<\/span>\}'
content = re.sub(email_regex, '', content)

mobile_regex = r'<PhoneCall className="w-4 h-4 text-blue-500"\/>\s*\{lead\.mobile\}'
new_mobile = """<div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-blue-500"/> {lead.mobile}
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[11px] border border-slate-200 truncate">{lead.email}</span>
                        </div>
                      )}
                    </div>"""
content = re.sub(mobile_regex, new_mobile, content)

# 2. Hide Follow up and Lead details on Customer Eligibility
col4_regex = r'\{\/\* Col 4: Actions \*\/\}\s*<div className="flex-1 min-w-\[200px\] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col items-end gap-3 justify-center">([\s\S]*?)<\/div>\s*<\/div>\s*\)\)\s*\)'

def col4_replacement(match):
    inner_code = match.group(1)
    
    # We want to conditionally render the follow-up date and lead details ONLY if filterTab !== "eligibility"
    new_inner = """
                {filterTab !== "eligibility" && (
                  <div className="w-full flex flex-col gap-3">
                    <div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 shadow-sm mb-1">
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3"/> Follow-up Date
                        </div>
                        <input 
                          type="date" 
                          value={lead.nextFollowUp ? new Date(lead.nextFollowUp).toISOString().split('T')[0] : ''}
                          onChange={(e) => updateFollowUp(lead._id, e.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                    <button onClick={() => handleOpenDetails(lead)} className="w-full justify-center flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5" /> Lead Details
                    </button>
                  </div>
                )}
"""
    buttons_regex = r'\{filterTab === "eligibility" \? \([\s\S]*?\) : null\}'
    buttons_match = re.search(buttons_regex, inner_code)
    
    if buttons_match:
        new_inner += f"""
                <div className="w-full mt-auto">
                  {buttons_match.group(0)}
                </div>
        """
    return '{/* Col 4: Actions */}\n              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col items-end gap-3 justify-center">' + new_inner + '              </div>'

# Apply Col 4 replacement
content = re.sub(col4_regex, col4_replacement, content)


with open("src/components/bde/BDELeadManagement.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("Done Lead Management UI Patch")
