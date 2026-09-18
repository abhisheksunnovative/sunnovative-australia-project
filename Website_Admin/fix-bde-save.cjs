const fs = require('fs');
let code = fs.readFileSync('src/components/BDEManagementScreen.jsx', 'utf8');

const oldHandleSave = `  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        isActive: formData.isActive,
        bdeType: formData.bdeType,
        freelancerSettings: formData.bdeType === "Freelancer" ? {
          commissionType: formData.commissionType,
          commissionAmount: formData.commissionAmount,
          projectTypeCommissions: formData.projectTypeCommissions
        } : undefined,
        assignedCountries: formData.assignedCountries.split(",").map(s => s.trim().toLowerCase()).filter(Boolean),
        assignedStates: formData.assignedStates.split(",").map(s => s.trim()).filter(Boolean),
        assignedDistricts: formData.assignedDistricts.split(",").map(s => s.trim()).filter(Boolean),
        assignedRegions: formData.assignedRegions.split(",").map(s => s.trim()).filter(Boolean),
        assignedPincodes: formData.assignedPincodes.split(",").map(s => s.trim()).filter(Boolean),
        assignedProjectTypes: formData.assignedProjectTypes,
        targets: { leads: formData.targetLeads, conversions: formData.targetConversions }
      };

      if (!currentBde) {
        await fetch(\`\${API_BASE}/api/bde\`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
      } else {
        await fetch(\`\${API_BASE}/api/bde/\${currentBde._id}\`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
      }
      setIsEditing(false);
      fetchBDEs();
    } catch (e) {
      console.error(e);
    }
  };`;

const newHandleSave = `  const handleSave = async () => {
    try {
      if (!formData.name || !formData.email || !formData.mobile) {
        alert("Please fill out Name, Email, and Mobile.");
        return;
      }
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        isActive: formData.isActive,
        bdeType: formData.bdeType,
        freelancerSettings: formData.bdeType === "Freelancer" ? {
          commissionType: formData.commissionType,
          commissionAmount: formData.commissionAmount,
          projectTypeCommissions: formData.projectTypeCommissions
        } : undefined,
        assignedCountries: (formData.assignedCountries || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean),
        assignedStates: (formData.assignedStates || "").split(",").map(s => s.trim()).filter(Boolean),
        assignedDistricts: (formData.assignedDistricts || "").split(",").map(s => s.trim()).filter(Boolean),
        assignedRegions: (formData.assignedRegions || "").split(",").map(s => s.trim()).filter(Boolean),
        assignedPincodes: (formData.assignedPincodes || "").split(",").map(s => s.trim()).filter(Boolean),
        assignedProjectTypes: formData.assignedProjectTypes,
        targets: { leads: formData.targetLeads, conversions: formData.targetConversions }
      };

      let res, data;
      if (!currentBde) {
        res = await fetch(\`\${API_BASE}/api/bde\`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(\`\${API_BASE}/api/bde/\${currentBde._id}\`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
      }
      
      data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save BDE");
      }
      
      alert(currentBde ? "BDE Updated Successfully!" : "BDE Registered Successfully!");
      setIsEditing(false);
      fetchBDEs();
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };`;

code = code.replace(oldHandleSave, newHandleSave);
fs.writeFileSync('src/components/BDEManagementScreen.jsx', code);
