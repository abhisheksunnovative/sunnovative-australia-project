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
content = content.replace(
    '<div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 shadow-sm mb-1">',
    '{filterTab !== "eligibility" && (\n                  <div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 shadow-sm mb-1">'
)

content = content.replace(
    '<button onClick={() => handleOpenDetails(lead)} className="w-full justify-center flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm">\n                      <CheckCircle className="w-3.5 h-3.5" /> Lead Details\n                    </button>',
    '<button onClick={() => handleOpenDetails(lead)} className="w-full justify-center flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm">\n                      <CheckCircle className="w-3.5 h-3.5" /> Lead Details\n                    </button>\n                )}'
)


# 3. Handle Qualify validation
qualify_regex = r'const handleQualify = async \(lead\) => \{'
new_qualify = """const handleQualify = async (lead) => {
    if (!lead.nextFollowUp) {
      alert("Please select a Follow-up Date on the card before finalizing the installation date.");
      return;
    }"""
content = re.sub(qualify_regex, new_qualify, content)


# 4. Metric Cards styling
old_grid = """      {Object.keys(projectTypeCounts).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(projectTypeCounts).map(([pt, count]) => (
            <div 
              key={pt} 
              onClick={() => setFilterProject(filterProject === pt ? "" : pt)}
              className={`bg-white border rounded-xl p-4 flex flex-col justify-center cursor-pointer transition-all hover:shadow-md ${filterProject === pt ? 'ring-2 ring-blue-500 shadow-md border-transparent' : 'border-slate-200'}`}
            >
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{pt}</div>
              <div className="text-3xl font-bold text-slate-800">{count}</div>
            </div>
          ))}
        </div>
      )}"""
      
new_grid = """      {Object.keys(projectTypeCounts).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(projectTypeCounts).map(([pt, count]) => (
            <div 
              key={pt} 
              onClick={() => setFilterProject(filterProject === pt ? "" : pt)}
              className={`bg-white border rounded-xl p-4 flex flex-col justify-center cursor-pointer transition-all hover:shadow-md ${filterProject === pt ? 'ring-2 ring-blue-500 shadow-md border-transparent' : 'border-slate-200'}`}
            >
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Project Type</div>
              <div className="text-lg font-bold text-slate-800 uppercase truncate">{pt}</div>
              <div className="text-3xl font-black text-blue-600 mt-2">{count}</div>
            </div>
          ))}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 flex flex-col justify-center">
              <div className="text-[10px] font-black text-emerald-600/70 uppercase tracking-wider mb-1">Total Leads</div>
              <div className="text-lg font-bold text-emerald-900 uppercase">In Bucket</div>
              <div className="text-3xl font-black text-emerald-600 mt-2">{Object.values(projectTypeCounts).reduce((a,b)=>a+b,0)}</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4 flex flex-col justify-center">
              <div className="text-[10px] font-black text-indigo-600/70 uppercase tracking-wider mb-1">Status</div>
              <div className="text-lg font-bold text-indigo-900 uppercase">Active</div>
              <div className="text-3xl font-black text-indigo-600 mt-2">{Object.values(projectTypeCounts).reduce((a,b)=>a+b,0)}</div>
          </div>
        </div>
      )}"""

content = content.replace(old_grid, new_grid)

with open("src/components/bde/BDELeadManagement.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("Safe patch done")
