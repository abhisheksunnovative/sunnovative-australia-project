const fs = require('fs');
let text = fs.readFileSync('Website_Frontend/src/customer/CustomerPortal.jsx', 'utf-8');

const logic = `
  const handleCancelOverdueProject = async (projectId) => {
    try {
      const res = await authFetch(\`/api/customer/projects/\${projectId}/cancel\`, { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        toast.success("Your order has been cancelled.");
        fetchProjects();
      } else {
        toast.error(d.message || "Failed to cancel order.");
      }
    } catch(e) {
      toast.error("Error cancelling order.");
    }
  };

  const getOverdueProject = () => {
    if (!projects || projects.length === 0) return null;
    const slaDays = journeySettings?.installDateSelectionSlaDays || 3;
    
    return projects.find(p => {
      if (p.status === 'Cancelled' || p.status === 'Lost') return false;
      const hasDate = p.preferredInstallDate || (p.installDateNegotiation && p.installDateNegotiation.customerStatus !== 'pending');
      if (hasDate) return false;

      const created = new Date(p.createdAt);
      const diffDays = Math.ceil(Math.abs(new Date() - created) / (1000 * 60 * 60 * 24));
      
      return diffDays > slaDays;
    });
  };
  const overdueProject = getOverdueProject();
  const slaDays = journeySettings?.installDateSelectionSlaDays || 3;
`;

const idx = text.indexOf('return (\n    <div className="min-h-screen');
text = text.slice(0, idx) + logic + '\n  ' + text.slice(idx);

fs.writeFileSync('Website_Frontend/src/customer/CustomerPortal.jsx', text);
