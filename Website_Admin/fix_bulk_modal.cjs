const fs = require('fs');

let c = fs.readFileSync('src/components/UnifiedAddLeadModal.jsx', 'utf8');

// 1. Add useAdminSettings import if not present
if (!c.includes('useAdminSettings')) {
  c = c.replace('import { Upload, X, CheckCircle, AlertTriangle, ScanLine, FileText } from "lucide-react";', 'import { Upload, X, CheckCircle, AlertTriangle, ScanLine, FileText } from "lucide-react";\nimport { useAdminSettings } from "../hooks/useAdminSettings";');
}

// 2. Add fetching logic inside the component
const fetchLogic = `
  const { projectTypes } = useAdminSettings(userCountry);
  const [bdeProjectTypes, setBdeProjectTypes] = useState([]);
  
  useEffect(() => {
    if (isBDE && bdeId) {
      fetch(\`\${API_BASE}/api/bde/\${bdeId}\`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.bde && data.bde.assignedProjectTypes) {
            setBdeProjectTypes(data.bde.assignedProjectTypes);
          }
        })
        .catch(err => console.error("Failed to fetch BDE details:", err));
    }
  }, [isBDE, bdeId]);

  // Filter project types
  const availableProjectTypes = isBDE && bdeProjectTypes.length > 0 
    ? projectTypes.filter(pt => bdeProjectTypes.includes(pt.value))
    : projectTypes;

  useEffect(() => {
    if (availableProjectTypes.length > 0 && (!bulkSolarType || !availableProjectTypes.find(pt => pt.value === bulkSolarType))) {
      setBulkSolarType(availableProjectTypes[0].value);
    }
  }, [availableProjectTypes, bulkSolarType]);

  // Ensure bulkCountry matches userCountry
  useEffect(() => {
    if (userCountry && bulkCountry.toLowerCase() !== userCountry.toLowerCase()) {
      setBulkCountry(userCountry);
    }
  }, [userCountry, bulkCountry]);
`;

// Insert the fetchLogic after `const [isSubmitting, setIsSubmitting] = useState(false);`
if (c.includes('const [isSubmitting, setIsSubmitting] = useState(false);') && !c.includes('const { projectTypes } = useAdminSettings')) {
  c = c.replace('const [isSubmitting, setIsSubmitting] = useState(false);', 'const [isSubmitting, setIsSubmitting] = useState(false);\n' + fetchLogic);
}

// 3. Replace the grid containing Solar Type and Country
const gridToReplace = `<div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Solar Type</label>
                      <select value={bulkSolarType} onChange={e => setBulkSolarType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Country</label>
                      <select value={bulkCountry} onChange={e => setBulkCountry(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                        <option value="India">India</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>`;

const newGrid = `<div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Solar Type</label>
                      <select value={bulkSolarType} onChange={e => setBulkSolarType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                        {availableProjectTypes.map(pt => (
                          <option key={pt.value} value={pt.value}>{pt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>`;

if (c.includes('grid grid-cols-2 gap-4')) {
  c = c.replace(gridToReplace, newGrid);
}

// 4. Update the actual import React statement if it doesn't have useEffect
if (c.includes('import React, { useState, useRef } from "react";')) {
  c = c.replace('import React, { useState, useRef } from "react";', 'import React, { useState, useRef, useEffect } from "react";');
}

fs.writeFileSync('src/components/UnifiedAddLeadModal.jsx', c);
console.log("Patched UnifiedAddLeadModal!");
