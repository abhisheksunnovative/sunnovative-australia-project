import re

with open("src/components/bde/BDEProspects.jsx", "r", encoding="utf8") as f:
    content = f.read()

col3_regex = r'\{!lead\.tokenPaid \? \([\s\S]*?\) : \('
def col3_replacement(match):
    return """{!lead.tokenPaid ? (
    <div className="flex flex-col gap-2 mt-4 lg:mt-0">
      {!isAU ? (
        <>
          <p className="text-[10px] font-bold text-rose-600 text-center uppercase">Ask customer to pay token to start order journey</p>
          <button disabled className="w-full py-2.5 bg-slate-300 text-slate-500 cursor-not-allowed text-sm font-bold rounded-lg transition flex justify-center items-center gap-2">
            <DollarSign className="w-4 h-4" /> Go to Order Journey
          </button>
          <button onClick={() => handleSimulatePayment(lead)} className="text-[10px] text-blue-600 underline text-center mt-1">Simulate Token Payment</button>
        </>
      ) : (
        <>
          <p className="text-[10px] font-bold text-emerald-600 text-center uppercase">Ready for Order Journey</p>
          <button onClick={() => handleSimulatePayment(lead)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm font-bold rounded-lg transition flex justify-center items-center gap-2">
            <DollarSign className="w-4 h-4" /> Move to Order Journey
          </button>
        </>
      )}
    </div>
  ) : ("""

content = re.sub(col3_regex, col3_replacement, content)

# Let's fix the metric cards styling
# "jo cads hai unko tgoda acha rko une prijctype ek cards em heading do rpojct type leads usek ands nuemkmb shwo kro priejc type show kro thek hia baii ek do or crads dedo usemuapr taki bahr abarh lage ok apenhisabs e ok"

# The cards are mapped in BDEProspects.jsx
# <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
#   {Object.entries(projectTypeCounts).map(([pt, count]) => (
#     <div key={pt} className="...">

cards_regex = r'\{Object\.entries\(projectTypeCounts\)\.map\(\(\[pt, count\]\) => \([\s\S]*?\}\)'

new_cards = """{Object.entries(projectTypeCounts).map(([pt, count]) => (
          <div key={pt} onClick={() => setProjectFilter(projectFilter === pt ? "" : pt)} className={`bg-white border rounded-xl p-4 flex flex-col justify-center cursor-pointer transition-all hover:shadow-md ${projectFilter === pt ? 'ring-2 ring-blue-500 shadow-md border-transparent' : 'border-slate-200'}`}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Project Type</div>
            <div className="text-xl font-bold text-slate-800 uppercase truncate">{pt}</div>
            <div className="text-3xl font-black text-blue-600 mt-2">{count}</div>
          </div>
        ))}
        {/* Fillers to make it look full */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 flex flex-col justify-center">
            <div className="text-[10px] font-black text-emerald-600/70 uppercase tracking-wider mb-1">Total Prospects</div>
            <div className="text-xl font-bold text-emerald-900 uppercase">Active</div>
            <div className="text-3xl font-black text-emerald-600 mt-2">{Object.values(projectTypeCounts).reduce((a,b)=>a+b,0)}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 flex flex-col justify-center">
            <div className="text-[10px] font-black text-amber-600/70 uppercase tracking-wider mb-1">Conversion</div>
            <div className="text-xl font-bold text-amber-900 uppercase">Rate</div>
            <div className="text-3xl font-black text-amber-600 mt-2">--</div>
        </div>}"""

# Wait, the cards logic in BDEProspects uses projectTypeFilter, not projectFilter. Let's fix that.
# Let's just do a simpler string replace for the card mapping.
content = content.replace('onClick={() => setProjectTypeFilter(projectTypeFilter === pt ? "All" : pt)}', 'onClick={() => setProjectTypeFilter(projectTypeFilter === pt ? "All" : pt)}')
# Actually I'll use replace for the whole grid
old_grid = """      {Object.keys(projectTypeCounts).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(projectTypeCounts).map(([pt, count]) => (
            <div 
              key={pt} 
              onClick={() => setProjectTypeFilter(projectTypeFilter === pt ? "All" : pt)}
              className={`bg-white border rounded-xl p-4 flex flex-col justify-center cursor-pointer transition-all hover:shadow-md ${projectTypeFilter === pt ? 'ring-2 ring-blue-500 shadow-md border-transparent' : 'border-slate-200'}`}
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
              onClick={() => setProjectTypeFilter(projectTypeFilter === pt ? "All" : pt)}
              className={`bg-white border rounded-xl p-4 flex flex-col justify-center cursor-pointer transition-all hover:shadow-md ${projectTypeFilter === pt ? 'ring-2 ring-blue-500 shadow-md border-transparent' : 'border-slate-200'}`}
            >
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Project Type</div>
              <div className="text-lg font-bold text-slate-800 uppercase truncate">{pt}</div>
              <div className="text-3xl font-black text-blue-600 mt-2">{count}</div>
            </div>
          ))}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 flex flex-col justify-center">
              <div className="text-[10px] font-black text-emerald-600/70 uppercase tracking-wider mb-1">Total Prospects</div>
              <div className="text-lg font-bold text-emerald-900 uppercase">Active Leads</div>
              <div className="text-3xl font-black text-emerald-600 mt-2">{Object.values(projectTypeCounts).reduce((a,b)=>a+b,0)}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 flex flex-col justify-center">
              <div className="text-[10px] font-black text-amber-600/70 uppercase tracking-wider mb-1">Action Required</div>
              <div className="text-lg font-bold text-amber-900 uppercase">Pending</div>
              <div className="text-3xl font-black text-amber-600 mt-2">{Object.values(projectTypeCounts).reduce((a,b)=>a+b,0)}</div>
          </div>
        </div>
      )}"""
content = content.replace(old_grid, new_grid)

with open("src/components/bde/BDEProspects.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("Prospects patched for AU and Cards")
