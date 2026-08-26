import re

with open("src/components/bde/BDEProspects.jsx", "r", encoding="utf8") as f:
    content = f.read()

# 1. Add projectTypeCounts
counts = """
  const projectTypeCounts = leads.reduce((acc, lead) => {
    const pt = (lead.solarType || lead.projectType || "Residential").toLowerCase();
    acc[pt] = (acc[pt] || 0) + 1;
    return acc;
  }, {});

  const filteredLeads = leads.filter(l => {"""
if "projectTypeCounts =" not in content:
    content = content.replace("const filteredLeads = leads.filter(l => {", counts)

# 2. Render cards
cards = """
      {/* PROJECT TYPE METRIC CARDS */}
      {Object.keys(projectTypeCounts).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(projectTypeCounts).map(([type, count]) => (
            <div 
              key={type}
              onClick={() => setProjectTypeFilter(projectTypeFilter === type ? "All" : type)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${projectTypeFilter === type ? 'bg-blue-50 border-blue-400 shadow-md' : 'bg-white border-slate-200 hover:border-blue-300'}`}
            >
              <p className="text-[10px] font-bold text-slate-500 uppercase">{type.replace(/-/g, ' ')}</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">"""

if "PROJECT TYPE METRIC CARDS" not in content:
    content = content.replace('<div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">', cards)

# 3. Remove select dropdown
select_dropdown = r'<select value=\{projectTypeFilter\} onChange=\{e => setProjectTypeFilter\(e\.target\.value\)\} className="px-3 py-2 border rounded-lg text-sm outline-none bg-slate-50">\s*<option value="All">All Types</option>\s*\{dynamicProjectTypes\.map\(pt => <option key=\{pt\.value\} value=\{pt\.value\}>\{pt\.label\}</option>\)\}\s*</select>'
content = re.sub(select_dropdown, '', content)

# 4. In BDEProspects, projectTypeFilter uses original strings, so when checking equality, it might be case sensitive.
# Earlier filtering code: if (projectTypeFilter !== "All" && l.solarType !== projectTypeFilter) return false;
content = content.replace(
    'if (projectTypeFilter !== "All" && l.solarType !== projectTypeFilter) return false;',
    'if (projectTypeFilter !== "All" && (l.solarType || l.projectType || "Residential").toLowerCase() !== projectTypeFilter.toLowerCase()) return false;'
)

with open("src/components/bde/BDEProspects.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("Done")
