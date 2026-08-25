const fs = require('fs');

function fixAust() {
  let c = fs.readFileSync('src/components/bde/BDEAustDashboard.jsx', 'utf8');

  // Insert Top 4 Cards after the banner block
  // Banner block ends with:
  //       </div>
  //     </div>
  //
  //     {/* KPI CARDS */}
  if (!c.includes('NEW COUNTRY CARD')) {
    const bannerEnd = `      </div>

      {/* KPI CARDS */}`;
    const top4 = `      </div>

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

        <div onClick={() => typeof onTabChange !== 'undefined' && onTabChange("bde-leads")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-blue-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats?.leadsTarget?.totalAssigned || 0}</h3>
          </div>
        </div>

        <div onClick={() => typeof onTabChange !== 'undefined' && onTabChange("bde-prospects")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-amber-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Prospects</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats?.activeCustomers || 0}</h3>
          </div>
        </div>

        <div onClick={() => typeof onTabChange !== 'undefined' && onTabChange("bde-projects")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-emerald-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Journey</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats?.ordersGenerated || 0}</h3>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}`;
    c = c.replace(bannerEnd, top4);
  }

  // Rename Authorized Project Types to Commission Per Lead
  c = c.replace(/Authorized Project Types/g, 'Commission Per Lead');

  // Wrap Commission Per Lead in {stats.isFreelancer && ( ... )}
  if (c.includes('Commission Per Lead') && !c.includes('{stats.isFreelancer && (\\n      <div>\\n        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">\\n          <Zap className="w-5 h-5 text-yellow-500" /> Commission Per Lead')) {
    
    // Find the entire div block that contains Commission Per Lead up to before "Leads vs Conversions"
    const startIdx = c.indexOf('<div>\n        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">\n          <Zap className="w-5 h-5 text-yellow-500" /> Commission Per Lead');
    const endIdx = c.indexOf('<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 mt-6">');
    
    if (startIdx !== -1 && endIdx !== -1) {
       const block = c.substring(startIdx, endIdx);
       const wrapped = `{stats.isFreelancer && (\n      ${block}      )}\n\n      `;
       c = c.substring(0, startIdx) + wrapped + c.substring(endIdx);
    }
  }
  
  fs.writeFileSync('src/components/bde/BDEAustDashboard.jsx', c);
}

function fixGlobal() {
  let c = fs.readFileSync('src/components/bde/BDEDashboard.jsx', 'utf8');

  // Rename Authorized Project Types to Commission Per Lead
  c = c.replace(/Authorized Project Types/g, 'Commission Per Lead');

  // Wrap Commission Per Lead in {isFreelancer && ( ... )}
  if (c.includes('Commission Per Lead') && !c.includes('{isFreelancer && (\\n      <div>\\n        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">\\n          <Zap className="w-5 h-5 text-yellow-500" /> Commission Per Lead')) {
    
    const startIdx = c.indexOf('<div>\n        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">\n          <Zap className="w-5 h-5 text-yellow-500" /> Commission Per Lead');
    const endIdx = c.indexOf('<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 mt-6">');
    
    if (startIdx !== -1 && endIdx !== -1) {
       const block = c.substring(startIdx, endIdx);
       const wrapped = `{isFreelancer && (\n      ${block}      )}\n\n      `;
       c = c.substring(0, startIdx) + wrapped + c.substring(endIdx);
    }
  }

  // Remove `!isFreelancer && (` from Target Progress Bars
  if (c.includes('{!isFreelancer && (\n        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">')) {
     const startIdx = c.indexOf('{!isFreelancer && (\n        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">');
     // The block ends before `{/* KPI CARDS */}` or `Commission Per Lead`
     // Just replace the start and we will find the matching `)}`
     c = c.replace('{!isFreelancer && (\n        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">', '<div className="grid grid-cols-1 md:grid-cols-2 gap-6">');
     // Now find the `)}` that was after it. It was right before `{/* KPI CARDS */}` or `{/* PROJECT TYPES`
     c = c.replace('          </div>\n        </div>\n      )}\n\n      {', '          </div>\n        </div>\n\n      {');
  }

  // Make 4 cards clickable
  // Leads card
  c = c.replace(/<div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200\/80 flex items-center gap-4">\s*<div className="w-12 h-12 rounded-2xl bg-blue-50/g, 
                '<div onClick={() => typeof onTabChange !== "undefined" && onTabChange("bde-leads")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-blue-500 cursor-pointer transition-colors">\n          <div className="w-12 h-12 rounded-2xl bg-blue-50');

  // Prospects card
  c = c.replace(/<div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200\/80 flex items-center gap-4">\s*<div className="w-12 h-12 rounded-2xl bg-amber-50/g, 
                '<div onClick={() => typeof onTabChange !== "undefined" && onTabChange("bde-prospects")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-amber-500 cursor-pointer transition-colors">\n          <div className="w-12 h-12 rounded-2xl bg-amber-50');

  // Order Journey card
  c = c.replace(/<div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200\/80 flex items-center gap-4">\s*<div className="w-12 h-12 rounded-2xl bg-emerald-50/g, 
                '<div onClick={() => typeof onTabChange !== "undefined" && onTabChange("bde-projects")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-emerald-500 cursor-pointer transition-colors">\n          <div className="w-12 h-12 rounded-2xl bg-emerald-50');


  fs.writeFileSync('src/components/bde/BDEDashboard.jsx', c);
}

fixAust();
fixGlobal();
