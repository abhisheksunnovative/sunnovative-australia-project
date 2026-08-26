const fs = require('fs');

let c = fs.readFileSync('src/components/UnifiedAddLeadModal.jsx', 'utf8');

const scanReplacement = `
      const form = new FormData();
      form.append("billFile", uploadedFile);

      const res = await fetch(\`\${API_BASE}/api/light-bill/scan\`, {
        method: "POST",
        headers: { "x-country": isAU ? "AU" : "IN" },
        body: form
      });

      const data = await res.json();
      console.log("Bulk upload response:", data);
      if (!res.ok) throw new Error(data.message || "Scan failed");

      let savedBillUrl = null;
      try {
        const uploadRes = await fetch(\`\${API_BASE}/api/upload-file\`, {
          method: "POST",
          body: form
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          savedBillUrl = uploadData.fileUrl;
        }
      } catch(e) {
        console.warn("Could not upload actual file, only scanned:", e);
      }
`;

const originalScan = `
      const form = new FormData();
      form.append("billFile", uploadedFile);

      const res = await fetch(\`\${API_BASE}/api/light-bill/scan\`, {
        method: "POST",
        headers: { "x-country": isAU ? "AU" : "IN" },
        body: form
      });

      const data = await res.json();
      console.log("Bulk upload response:", data);
      if (!res.ok) throw new Error(data.message || "Scan failed");
`;

const originalSetState = `
      setFormData(prev => ({
        ...prev,
        name: ex.consumerName || prev.name,
`;

const replacementSetState = `
      setFormData(prev => ({
        ...prev,
        billUrl: savedBillUrl,
        name: ex.consumerName || prev.name,
`;

if (!c.includes('savedBillUrl = uploadData.fileUrl')) {
  c = c.replace(originalScan, scanReplacement);
  c = c.replace(originalSetState, replacementSetState);
  fs.writeFileSync('src/components/UnifiedAddLeadModal.jsx', c);
  console.log("Patched UnifiedAddLeadModal.jsx");
} else {
  console.log("Already patched.");
}
