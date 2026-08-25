const fs = require('fs');

function fixDashboard(file) {
  let c = fs.readFileSync(file, 'utf8');

  // 1. Remove `!isFreelancer && (` around Target Progress Bars
  c = c.replace(/{!isFreelancer && \(\s*(<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<\/div>)\s*\)}/g, '$1');

  // 3. Hide Commission / Project Types for Full-time BDE
  if (c.includes('Authorized Project Types')) {
    c = c.replace(/<div>\s*<h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">[\s\S]*?(<Zap className="w-5 h-5 text-yellow-500" \/> Authorized Project Types|Commission Per Lead)[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, match => {
      return `{isFreelancer && (\n${match}\n)}`;
    });
  }
  
  if (c.includes('Commission Per Lead') && !c.includes('{isFreelancer && (\\n<div>\\n        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">\\n          <Zap className="w-5 h-5 text-yellow-500" /> Commission Per Lead')) {
    c = c.replace(/<div>\s*<h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">[\s\S]*?(<Zap className="w-5 h-5 text-yellow-500" \/> Commission Per Lead)[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, match => {
      return `{isFreelancer && (\n${match}\n)}`;
    });
  }

  // 4. Make Top 4 cards clickable
  // Country card (don't make it clickable)
  c = c.replace(/<div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 shadow-sm border border-indigo-100 flex items-center gap-4">/g, 
                '<div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 shadow-sm border border-indigo-100 flex items-center gap-4">');
  
  // Leads card
  c = c.replace(/<div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200\/80 flex items-center gap-4">\s*<div className="w-12 h-12 rounded-2xl bg-blue-50/g, 
                '<div onClick={() => onTabChange && onTabChange("bde-leads")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-blue-500 cursor-pointer transition-colors">\n          <div className="w-12 h-12 rounded-2xl bg-blue-50');

  // Prospects card
  c = c.replace(/<div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200\/80 flex items-center gap-4">\s*<div className="w-12 h-12 rounded-2xl bg-amber-50/g, 
                '<div onClick={() => onTabChange && onTabChange("bde-prospects")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-amber-500 cursor-pointer transition-colors">\n          <div className="w-12 h-12 rounded-2xl bg-amber-50');

  // Order Journey card
  c = c.replace(/<div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200\/80 flex items-center gap-4">\s*<div className="w-12 h-12 rounded-2xl bg-emerald-50/g, 
                '<div onClick={() => onTabChange && onTabChange("bde-projects")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-emerald-500 cursor-pointer transition-colors">\n          <div className="w-12 h-12 rounded-2xl bg-emerald-50');

  // Replace "Authorized Project Types" with "Commission Per Lead"
  c = c.replace(/Authorized Project Types/g, "Commission Per Lead");

  fs.writeFileSync(file, c);
}

// Ensure 4 cards exist in Aust Dashboard.
let aust = fs.readFileSync('src/components/bde/BDEAustDashboard.jsx', 'utf8');
if (!aust.includes('NEW COUNTRY CARD')) {
  const fourCards = `
      {/* NEW COUNTRY CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 shadow-sm border border-indigo-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Country</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">AUSTRALIA</h3>
          </div>
        </div>

        <div onClick={() => onTabChange && onTabChange("bde-leads")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-blue-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats.leadsTarget?.totalAssigned || 0}</h3>
          </div>
        </div>

        <div onClick={() => onTabChange && onTabChange("bde-prospects")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-amber-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Prospects</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats.activeCustomers || 0}</h3>
          </div>
        </div>

        <div onClick={() => onTabChange && onTabChange("bde-projects")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-emerald-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Journey</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats.ordersGenerated || 0}</h3>
          </div>
        </div>
      </div>
  `;
  
  aust = aust.replace(/(<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<\/div>\s*<\/div>)/, '$1\n' + fourCards);
  fs.writeFileSync('src/components/bde/BDEAustDashboard.jsx', aust);
}

fixDashboard('src/components/bde/BDEAustDashboard.jsx');
fixDashboard('src/components/bde/BDEDashboard.jsx');
