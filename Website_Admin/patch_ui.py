import re

# ==========================================
# 1. BDELayout.jsx - Add Eligibility count
# ==========================================
layout_file = "src/components/bde/BDELayout.jsx"
with open(layout_file, "r", encoding="utf8") as f:
    layout_content = f.read()

# Make sure tabCounts has eligibility
if 'eligibility: 0,' not in layout_content:
    layout_content = layout_content.replace(
        'const [tabCounts, setTabCounts] = useState({ leads: 0, prospects: 0, projects: 0 });',
        'const [tabCounts, setTabCounts] = useState({ eligibility: 0, leads: 0, prospects: 0, projects: 0 });'
    )

# Assign count to Customer Eligibility
layout_content = layout_content.replace(
    '{ id: "bde-customer-eligibility", name: "Customer Eligibility", icon: <ClipboardList className="w-5 h-5 text-amber-400" /> },',
    '{ id: "bde-customer-eligibility", name: "Customer Eligibility", icon: <ClipboardList className="w-5 h-5 text-amber-400" />, count: tabCounts.eligibility },'
)

# Fetch leads logic - we need to fetch all to get counts
fetch_block = """  const fetchCounts = async () => {
    try {
      if (!bdeId) return;
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";
      const userStr = localStorage.getItem("user");
      let token = "";
      let isFreelancer = false;
      if (userStr) {
        const u = JSON.parse(userStr);
        token = u.token;
        if (u.bdeType === "Freelancer") isFreelancer = true;
      }
      
      const leadsRes = await fetch(`${API_BASE}/api/bde/leads/${isFreelancer ? "manual" : "all"}`, { headers: { Authorization: `Bearer ${token}` } });
      let eligibilityCount = 0;
      let leadsCount = 0;
      let prospectsCount = 0;
      
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        const leads = data.leads || [];
        
        leads.forEach(l => {
          if (l.status === 'Converted' || l.status === 'Lost' || l.convertedProjectId) return;
          if (l.installDateBooked) prospectsCount++;
          else if (l.isEligibleForInstallation) leadsCount++;
          else eligibilityCount++;
        });
      }

      const projRes = await fetch(`${API_BASE}/api/bde/${bdeId}/projects`, { headers: { Authorization: `Bearer ${token}` } });
      let projectsCount = 0;
      if (projRes.ok) {
        const data = await projRes.json();
        projectsCount = (data.projects || []).length;
      }

      setTabCounts({ eligibility: eligibilityCount, leads: leadsCount, prospects: prospectsCount, projects: projectsCount });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [bdeId, currentTab]);"""

if 'setTabCounts({ eligibility: eligibilityCount' not in layout_content:
    layout_content = re.sub(
        r'const fetchCounts = async \(\) => \{[\s\S]*?\}, \[bdeId, currentTab\]\);',
        fetch_block,
        layout_content
    )

with open(layout_file, "w", encoding="utf8") as f:
    f.write(layout_content)


# ==========================================
# 2. BDELeadManagement.jsx - UI tweaks
# ==========================================
lead_file = "src/components/bde/BDELeadManagement.jsx"
with open(lead_file, "r", encoding="utf8") as f:
    lead_content = f.read()

# Move install badge and change Col 2 styling
install_badge_regex = r'\{\/\* Installation Date Badge \*\/\}\s*\{lead\.preferredInstallDate \? \([\s\S]*?Not Selected\s*<\/div>\s*\)\}'

install_badge_match = re.search(install_badge_regex, lead_content)
if install_badge_match:
    badge_code = install_badge_match.group(0)
    lead_content = lead_content.replace(badge_code, '')
    
    # We will inject this badge into Col 2 at the top.
    col2_regex = r'\{\/\* Col 2: System Info \*\/\}\s*<div className="flex-1 min-w-\[200px\] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center">'
    
    new_col2 = f"""{{/* Col 2: System Info */}}
              <div className="flex-1 min-w-[200px] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center">
                <div className="mb-4">
                  {badge_code}
                </div>
                <div className="text-xl font-black text-blue-900 capitalize mb-1 bg-blue-50 px-3 py-1.5 rounded-lg w-fit border border-blue-200">
                  ⚡ {{lead.solarType || "Residential"}} • {{lead.kw || "6.6"}} kW
                </div>
                <div className="text-sm text-slate-500 font-bold flex items-center gap-2 mb-3 px-1">
                  Est. Bill: 
                  <span className="text-slate-800 text-lg font-black">${{lead.billAmount || 0}} {{isAU ? 'AUD' : 'INR'}}</span>
                </div>"""
                
    lead_content = re.sub(r'\{\/\* Col 2: System Info \*\/\}\s*<div className="flex-1 min-w-\[200px\] lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center">[\s\S]*?<span className="bg-slate-100 px-2 py-0\.5 rounded-md border border-slate-200">\$\{lead\.billAmount \|\| 0\} \{isAU \? \'AUD\' : \'INR\'\}<\/span>\s*<\/div>', new_col2, lead_content)

with open(lead_file, "w", encoding="utf8") as f:
    f.write(lead_content)


# ==========================================
# 3. BDEProspects.jsx - UI tweaks + EPC logic
# ==========================================
prospects_file = "src/components/bde/BDEProspects.jsx"
with open(prospects_file, "r", encoding="utf8") as f:
    prospect_content = f.read()

# Add Est Bill support if missing, move install date if needed
# Let's completely replace the Col 2 in BDEProspects to match the new format + add EPC logic
# Wait, BDEProspects didn't have kW and bill amount in Col 2. We'll add them.

prospect_col2_regex = r'\{\/\* Col 2: Follow Up & Install \*\/\}\s*<div className="flex-1 min-w-\[250px\] w-full lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center">[\s\S]*?<\/div>\s*\{\/\* Col 3: Actions \*\/\}'

new_prospect_col2 = """{/* Col 2: System & Progress */}
              <div className="flex-1 min-w-[250px] w-full lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center">
                  <div className="mb-3">
                    {lead.preferredInstallDate ? (
                      <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit">
                        <Calendar className="w-4 h-4"/> Install Date: {new Date(lead.preferredInstallDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
                        <Calendar className="w-4 h-4"/> Install Date: Not Selected
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xl font-black text-blue-900 capitalize mb-1 bg-blue-50 px-3 py-1.5 rounded-lg w-fit border border-blue-200">
                    ⚡ {lead.solarType || lead.projectType || "Residential"} • {lead.kw || "0"} kW
                  </div>
                  <div className="text-sm text-slate-500 font-bold flex items-center gap-2 mb-3 px-1">
                    Est. Bill: 
                    <span className="text-slate-800 text-lg font-black">${lead.billAmount || lead.monthlyBillAmount || 0} {isAU ? 'AUD' : 'INR'}</span>
                  </div>

                  {lead.nextFollowUp && !isAU && <p className="text-xs text-amber-600 mt-2 font-semibold flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Token Follow-up: {new Date(lead.nextFollowUp).toDateString()}</p>}
                  
                  {lead.assignedEPCId || lead.epcDetails ? (
                    <div className="text-xs font-bold text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200 mt-2 w-fit">
                      ✓ EPC Assigned
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 mt-2 w-fit">
                      ⏳ Waiting for EPC to accept installation
                    </div>
                  )}
              </div>
              {/* Col 3: Actions */}"""

prospect_content = re.sub(prospect_col2_regex, new_prospect_col2, prospect_content)

# Remove the kW and solarType from Col 1 in BDEProspects so it's not duplicated
prospect_content = re.sub(r'<div className="flex items-center gap-2"><Zap className="w-4 h-4 text-slate-400"\/> \{lead\.kw\} kW \(\{lead\.solarType\}\)<\/div>', '', prospect_content)

with open(prospects_file, "w", encoding="utf8") as f:
    f.write(prospect_content)

print("Done")
