const fs = require('fs');
let c = fs.readFileSync('src/components/bde/BDEAustDashboard.jsx', 'utf8');

const startIndex = c.indexOf('  return (');
const endIndex = c.indexOf('{/* PROJECT TYPES CARDS REPLACING STC */}');

const newTop = `  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Australian Regional BDE Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track your Leads, Orders, and Performance</p>
        </div>
      </div>

      {/* Freelancer vs Company Header Banner */}
      {stats.isFreelancer ? (
        <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-2xl p-6 text-slate-950 shadow-md flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-yellow-400 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-950">Freelancer Commission Accrued</h3>
              <p className="text-sm font-medium text-slate-900">Total Accrued: \${(stats.freelancerSettings?.totalEarnings || 0).toLocaleString()}</p>
            </div>
          </div>
          <span className="bg-slate-950 text-yellow-400 text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider">AUSTRALIA</span>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl text-white">Company BDE</h3>
              <p className="text-blue-100 text-sm">Keep up the great work generating orders!</p>
            </div>
          </div>
        </div>
      )}

      {/* TOP 4 METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 shadow-sm border border-indigo-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Country</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5 uppercase">AUSTRALIA</h3>
          </div>
        </div>

        <div onClick={() => typeof onTabChange !== 'undefined' && onTabChange("bde-leads")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-blue-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Leads</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats?.leadsTarget?.totalAssigned || 0}</h3>
          </div>
        </div>

        <div onClick={() => typeof onTabChange !== 'undefined' && onTabChange("bde-projects")} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4 hover:border-emerald-500 cursor-pointer transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Journey</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats?.leadsTarget?.ordersGenerated || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Ratio</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{stats?.leadsTarget?.targetConversions > 0 ? Math.round((stats.leadsTarget.ordersGenerated / stats.leadsTarget.targetConversions)*100) : 0}%</h3>
          </div>
        </div>
      </div>

      {/* Target Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Leads Target</h3>
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-3xl font-bold text-gray-900">{stats.leadsTarget?.totalAssigned || 0}</span>
              <span className="text-gray-500 ml-2">/ {stats.leadsTarget?.targetLeads || 0} acquired</span>
            </div>
            <span className="text-blue-600 font-bold">{leadsPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: \`\${leadsPct}%\` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Conversions Target</h3>
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-3xl font-bold text-gray-900">{stats.leadsTarget?.ordersGenerated || 0}</span>
              <span className="text-gray-500 ml-2">/ {stats.leadsTarget?.targetConversions || 0} converted</span>
            </div>
            <span className="text-emerald-500 font-bold">{stats.leadsTarget?.targetConversions > 0 ? Math.min(100, Math.round((stats.leadsTarget.ordersGenerated / stats.leadsTarget.targetConversions) * 100)) : 0}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: \`\${stats.leadsTarget?.targetConversions > 0 ? Math.min(100, Math.round((stats.leadsTarget.ordersGenerated / stats.leadsTarget.targetConversions) * 100)) : 0}%\` }}></div>
          </div>
        </div>
      </div>

      `;

if (startIndex !== -1 && endIndex !== -1) {
  c = c.substring(0, startIndex) + newTop + c.substring(endIndex);
  fs.writeFileSync('src/components/bde/BDEAustDashboard.jsx', c);
  console.log("Updated BDEAustDashboard.jsx correctly!");
} else {
  console.log("Failed to find indices in Aust Dashboard");
}
