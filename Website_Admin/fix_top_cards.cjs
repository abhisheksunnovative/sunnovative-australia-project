const fs = require('fs');

function injectTop4(file) {
  let c = fs.readFileSync(file, 'utf8');
  
  if (c.includes('NEW COUNTRY CARD')) return;

  const top4 = `
      {/* NEW COUNTRY CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 shadow-sm border border-indigo-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Country</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{file.includes('Aust') ? 'AUSTRALIA' : 'GLOBAL'}</h3>
          </div>
        </div>

        <div onClick={() => typeof onTabChange !== 'undefined' && onTabChange("bde-leads")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-blue-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{trueLeadsCount}</h3>
          </div>
        </div>

        <div onClick={() => typeof onTabChange !== 'undefined' && onTabChange("bde-prospects")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-amber-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Prospects</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{trueProspectsCount}</h3>
          </div>
        </div>

        <div onClick={() => typeof onTabChange !== 'undefined' && onTabChange("bde-projects")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-emerald-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Journey</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{trueOrderJourneyCount}</h3>
          </div>
        </div>
      </div>
`;

  c = c.replace('{/* Target Progress Bars */}', top4 + '\n      {/* Target Progress Bars */}');
  c = c.replace(/\{stats\.totalAssigned\}/g, '{trueLeadsCount}');
  c = c.replace(/\{stats\.ordersGenerated\}/g, '{trueOrderJourneyCount}');

  const trueLeadsLogic = `
  const isFreelancer = bdeData?.bdeType === "Freelancer" || stats?.isFreelancer;
  const trueLeads = leads.filter(l => {
     const isManual = l.history?.some(h => h.action.includes("Manually created by BDE"));
     return isFreelancer ? isManual : !isManual;
  });
  const trueLeadsCount = trueLeads.filter(l => !l.installDateBooked && l.status !== 'Converted' && l.status !== 'Not Interested').length;
  const trueProspectsCount = trueLeads.filter(l => l.installDateBooked && !l.tokenPaid).length;
  const trueOrderJourneyCount = trueLeads.filter(l => l.tokenPaid || l.convertedProjectId).length;
  `;
  if (!c.includes('const trueLeadsCount')) {
     c = c.replace('return (', trueLeadsLogic + '\n  return (');
  }

  c = c.replace(/Authorized Project Types/g, 'Commission Per Lead');
  
  if (c.includes('Commission Per Lead') && !c.includes('{isFreelancer && (\\n<div>\\n        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">\\n          <Zap className="w-5 h-5 text-yellow-500" /> Commission Per Lead')) {
    const startIdx = c.indexOf('<div>\\n        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">\\n          <Zap className="w-5 h-5 text-yellow-500" /> Commission Per Lead'.replace(/\\n/g, '\n'));
    const endIdx = c.indexOf('<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 mt-6">');
    if (startIdx !== -1 && endIdx !== -1) {
       const block = c.substring(startIdx, endIdx);
       const wrapped = `{isFreelancer && (\n${block})}\n\n      `;
       c = c.substring(0, startIdx) + wrapped + c.substring(endIdx);
    }
  }

  if (c.includes('{!isFreelancer && (\n        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">')) {
     c = c.replace('{!isFreelancer && (\n        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">', '<div className="grid grid-cols-1 md:grid-cols-2 gap-6">');
     c = c.replace('          </div>\n        </div>\n      )}\n\n      {/* Commission', '          </div>\n        </div>\n\n      {/* Commission');
  }
  
  fs.writeFileSync(file, c);
}

injectTop4('src/components/bde/BDEDashboard.jsx');
injectTop4('src/components/bde/BDEAustDashboard.jsx');
