import re

with open("src/components/bde/BDELeadManagement.jsx", "r", encoding="utf8") as f:
    content = f.read()

old_base_leads = "  const baseLeads = leads.filter(l => !l.installDateBooked && l.status !== 'Converted' && l.status !== 'Not Interested' && l.status !== 'Lost' && !l.convertedProjectId);"

new_base_leads = """  const baseLeads = leads.filter(l => {
    if (l.installDateBooked || l.status === 'Converted' || l.status === 'Not Interested' || l.status === 'Lost' || l.convertedProjectId) return false;
    
    // Eligibility vs Self Leads filtering
    if (isFreelancer) {
      if (filterTab === "eligibility") {
        return !l.isEligibleForInstallation;
      } else if (filterTab === "self-leads") {
        return !!l.isEligibleForInstallation;
      }
    }
    
    return true;
  });"""

content = content.replace(old_base_leads, new_base_leads)

with open("src/components/bde/BDELeadManagement.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("Base leads patched")
