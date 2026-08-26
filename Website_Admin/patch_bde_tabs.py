import re

def patch_lead_management():
    path = 'src/components/bde/BDELeadManagement.jsx'
    with open(path, 'r', encoding='utf8') as f:
        content = f.read()

    # 1. Add filterProject state
    if 'const [filterProject, setFilterProject]' not in content:
        content = content.replace(
            'const [sortOrder, setSortOrder] = useState("date-desc");',
            'const [sortOrder, setSortOrder] = useState("date-desc");\n  const [filterProject, setFilterProject] = useState("");'
        )

    # 2. Modify "Add Lead" button condition
    content = content.replace(
        '{isFreelancer && (',
        '{isFreelancer && filterTab !== "self-leads" && ('
    )

    # 3. Add filter logic to displayedLeads
    if 'l.solarType || l.projectType' not in content.split('const displayedLeads =')[1].split('.filter(l => {')[1].split('return true')[0]:
        content = content.replace(
            'if (filterTab === "self-leads" && !l.isEligibleForInstallation) return false;',
            'if (filterTab === "self-leads" && !l.isEligibleForInstallation) return false;\n    if (filterProject && (l.solarType || l.projectType || "Residential").toLowerCase() !== filterProject.toLowerCase()) return false;'
        )

    # 4. Render Metric Cards
    cards_ui = """{/* PROJECT TYPE METRIC CARDS */}
      {Object.keys(projectTypeCounts).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(projectTypeCounts).map(([type, count]) => (
            <div 
              key={type}
              onClick={() => setFilterProject(filterProject === type ? "" : type)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${filterProject === type ? 'bg-blue-50 border-blue-400 shadow-md' : 'bg-white border-slate-200 hover:border-blue-300'}`}
            >
              <p className="text-[10px] font-bold text-slate-500 uppercase">{type.replace(/-/g, ' ')}</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{count}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* FILTER & SORT BAR */}"""
    
    if 'PROJECT TYPE METRIC CARDS' not in content:
        content = content.replace('{/* FILTER & SORT BAR */}', cards_ui)

    with open(path, 'w', encoding='utf8') as f:
        f.write(content)
    print("Patched BDELeadManagement")


def patch_prospects():
    path = 'src/components/bde/BDEProspects.jsx'
    with open(path, 'r', encoding='utf8') as f:
        content = f.read()

    # 1. Add filterProject state
    if 'const [filterProject, setFilterProject]' not in content:
        content = content.replace(
            'const [sortOrder, setSortOrder] = useState("date-desc");',
            'const [sortOrder, setSortOrder] = useState("date-desc");\n  const [filterProject, setFilterProject] = useState("");'
        )

    # 2. Add projectTypeCounts calculation
    counts_code = """const projectTypeCounts = leads.reduce((acc, lead) => {
    const pt = (lead.solarType || lead.projectType || "Residential").toLowerCase();
    acc[pt] = (acc[pt] || 0) + 1;
    return acc;
  }, {});
  
  const filteredLeads = leads.filter(l => {"""
    
    if 'projectTypeCounts =' not in content:
        content = content.replace('const filteredLeads = leads.filter(l => {', counts_code)

    # 3. Add filter logic to filteredLeads
    if 'l.solarType || l.projectType' not in content.split('const filteredLeads =')[1].split('.filter(l => {')[1].split('return true')[0]:
        content = content.replace(
            'const matchesSearch =',
            'if (filterProject && (l.solarType || l.projectType || "Residential").toLowerCase() !== filterProject.toLowerCase()) return false;\n    const matchesSearch ='
        )

    # 4. Render Metric Cards
    cards_ui = """{/* PROJECT TYPE METRIC CARDS */}
      {Object.keys(projectTypeCounts).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(projectTypeCounts).map(([type, count]) => (
            <div 
              key={type}
              onClick={() => setFilterProject(filterProject === type ? "" : type)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${filterProject === type ? 'bg-blue-50 border-blue-400 shadow-md' : 'bg-white border-slate-200 hover:border-blue-300'}`}
            >
              <p className="text-[10px] font-bold text-slate-500 uppercase">{type.replace(/-/g, ' ')}</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{count}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* FILTER BAR */}"""
    
    if 'PROJECT TYPE METRIC CARDS' not in content:
        content = content.replace('{/* FILTER BAR */}', cards_ui)

    with open(path, 'w', encoding='utf8') as f:
        f.write(content)
    print("Patched BDEProspects")


patch_lead_management()
patch_prospects()
