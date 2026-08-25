const http = require('http');
http.get('http://localhost:4005/api/bde/6a734103ad26aeb78ceb3b4d/leads', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const leads = json.leads;
    console.log("Total leads returned from API:", leads?.length);
    if (leads) {
      const baseLeads = leads.filter(l => !l.installDateBooked && l.status !== 'Converted' && l.status !== 'Not Interested' && l.status !== 'Lost' && !l.convertedProjectId);
      console.log("baseLeads count:", baseLeads.length);
      const manualLeads = baseLeads.filter(l => l.history?.some(h => h.action.includes("Manually created by BDE")));
      console.log("manualLeads count:", manualLeads.length);
      
      if (manualLeads.length === 0 && baseLeads.length > 0) {
        console.log("First baseLead history:", JSON.stringify(baseLeads[0].history));
      }
    }
  });
}).on('error', err => console.error(err));
