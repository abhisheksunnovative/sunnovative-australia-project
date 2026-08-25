const fs = require('fs');

let c = fs.readFileSync('src/components/UnifiedAddLeadModal.jsx', 'utf8');

// I will just replace the file with the corrected order.
// Let's first remove the previously injected logic.
const fetchLogic = `  const { projectTypes } = useAdminSettings(userCountry);
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

// It is currently between setIsSubmitting and const formData.
// Let's replace the whole file using regex or strict split to remove it.
const regex = /\s*const { projectTypes } = useAdminSettings[\s\S]*?}, \[userCountry, bulkCountry\]\);\s*/;
if (regex.test(c)) {
  c = c.replace(regex, '\n');
}

// Now inject it AFTER bulkError
const targetAnchor = 'const [bulkError, setBulkError] = useState("");';
if (c.includes(targetAnchor)) {
  c = c.replace(targetAnchor, targetAnchor + '\n\n' + fetchLogic);
  fs.writeFileSync('src/components/UnifiedAddLeadModal.jsx', c);
  console.log("Fixed the state initialization order!");
} else {
  console.log("Could not find the target anchor.");
}
