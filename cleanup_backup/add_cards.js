const fs = require('fs');
const path = 'Website_Admin/src/components/bde/BDEProspects.jsx';
let text = fs.readFileSync(path, 'utf8');

// 1. Add filter state for the new cards
const stateInjection = `const [activeSummaryFilter, setActiveSummaryFilter] = useState('All'); // 'All', 'DatePending', 'EPCPending', 'FollowUpToday', 'FollowUpTomorrow', 'FollowUpFuture'`;
text = text.replace('const [followUpFilter, setFollowUpFilter] = useState("All");', `const [followUpFilter, setFollowUpFilter] = useState("All");\n  ${stateInjection}`);

// 2. Modify filteredLeads logic to include activeSummaryFilter
const filterLogicMatch = `const filteredLeads = baseProspects.filter(l => {`;
const filterLogicReplace = `const filteredLeads = baseProspects.filter(l => {
    // Summary Card Filters
    if (activeSummaryFilter === 'DatePending' && l.preferredInstallDate) return false;
    if (activeSummaryFilter === 'EPCPending' && l.assignedEPCName) return false;
    
    if (activeSummaryFilter === 'FollowUpToday' || activeSummaryFilter === 'FollowUpTomorrow' || activeSummaryFilter === 'FollowUpFuture') {
      if (!l.nextFollowUp) return false;
      const today = new Date();
      const fu = new Date(l.nextFollowUp);
      const isToday = fu.toDateString() === today.toDateString();
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = fu.toDateString() === tomorrow.toDateString();
      
      if (activeSummaryFilter === 'FollowUpToday' && !isToday) return false;
      if (activeSummaryFilter === 'FollowUpTomorrow' && !isTomorrow) return false;
      if (activeSummaryFilter === 'FollowUpFuture' && (isToday || isTomorrow || fu < today)) return false;
    }`;
text = text.replace(filterLogicMatch, filterLogicReplace);

// 3. Generate calculations for the cards
const calculations = `
  const datePendingCount = baseProspects.filter(l => !l.preferredInstallDate).length;
  const epcPendingCount = baseProspects.filter(l => !l.assignedEPCName).length;
  
  const todayStr = new Date().toDateString();
  const tomorrowObj = new Date(); tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toDateString();
  
  let fuTodayCount = 0;
  let fuTomorrowCount = 0;
  let fuFutureCount = 0;
  
  baseProspects.forEach(l => {
    if(l.nextFollowUp) {
       const fuStr = new Date(l.nextFollowUp).toDateString();
       if(fuStr === todayStr) fuTodayCount++;
       else if(fuStr === tomorrowStr) fuTomorrowCount++;
       else if(new Date(l.nextFollowUp) > new Date()) fuFutureCount++;
    }
  });
`;
text = text.replace('// Collect all unique project types', `${calculations}\n  // Collect all unique project types`);

// 4. Inject UI just before `<div className="bg-white p-4`
const uiInjection = `
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            onClick={() => setActiveSummaryFilter(activeSummaryFilter === 'DatePending' ? 'All' : 'DatePending')}
            className={\`p-4 rounded-xl border-2 transition-all cursor-pointer shadow-sm flex flex-col justify-between \${activeSummaryFilter === 'DatePending' ? 'bg-rose-50 border-rose-400 ring-4 ring-rose-100' : 'bg-white border-slate-200 hover:border-rose-300'}\`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-rose-600 font-bold">
                <Calendar className="w-5 h-5"/> Installation Date Pending
              </div>
              <span className={\`text-xl font-black \${activeSummaryFilter === 'DatePending' ? 'text-rose-700' : 'text-slate-800'}\`}>{datePendingCount}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Needs Installation Date</p>
          </div>

          <div 
            onClick={() => setActiveSummaryFilter(activeSummaryFilter === 'EPCPending' ? 'All' : 'EPCPending')}
            className={\`p-4 rounded-xl border-2 transition-all cursor-pointer shadow-sm flex flex-col justify-between \${activeSummaryFilter === 'EPCPending' ? 'bg-blue-50 border-blue-400 ring-4 ring-blue-100' : 'bg-white border-slate-200 hover:border-blue-300'}\`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <MapPin className="w-5 h-5"/> EPC Assignment Pending
              </div>
              <span className={\`text-xl font-black \${activeSummaryFilter === 'EPCPending' ? 'text-blue-700' : 'text-slate-800'}\`}>{epcPendingCount}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Awaiting EPC Partner</p>
          </div>

          <div className="p-4 rounded-xl border-2 border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-amber-600 font-bold mb-3">
              <PhoneCall className="w-5 h-5"/> Follow-up Dates
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div 
                onClick={() => setActiveSummaryFilter(activeSummaryFilter === 'FollowUpToday' ? 'All' : 'FollowUpToday')}
                className={\`text-center p-1.5 rounded-lg border transition-all cursor-pointer \${activeSummaryFilter === 'FollowUpToday' ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-inner' : 'bg-slate-50 border-slate-200 hover:bg-amber-50 text-slate-600'}\`}
              >
                <div className="text-[10px] uppercase font-bold mb-1">Today</div>
                <div className="font-black text-sm">{fuTodayCount}</div>
              </div>
              <div 
                onClick={() => setActiveSummaryFilter(activeSummaryFilter === 'FollowUpTomorrow' ? 'All' : 'FollowUpTomorrow')}
                className={\`text-center p-1.5 rounded-lg border transition-all cursor-pointer \${activeSummaryFilter === 'FollowUpTomorrow' ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-inner' : 'bg-slate-50 border-slate-200 hover:bg-amber-50 text-slate-600'}\`}
              >
                <div className="text-[10px] uppercase font-bold mb-1">Tmrw</div>
                <div className="font-black text-sm">{fuTomorrowCount}</div>
              </div>
              <div 
                onClick={() => setActiveSummaryFilter(activeSummaryFilter === 'FollowUpFuture' ? 'All' : 'FollowUpFuture')}
                className={\`text-center p-1.5 rounded-lg border transition-all cursor-pointer \${activeSummaryFilter === 'FollowUpFuture' ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-inner' : 'bg-slate-50 border-slate-200 hover:bg-amber-50 text-slate-600'}\`}
              >
                <div className="text-[10px] uppercase font-bold mb-1">Future</div>
                <div className="font-black text-sm">{fuFutureCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4`;

text = text.replace('<div className="bg-white p-4', uiInjection);

// 5. Remove the old follow up dropdown
const dropdownRegex = /<select value=\{followUpFilter\}.*?<\/select>/s;
text = text.replace(dropdownRegex, '');

fs.writeFileSync(path, text);
console.log("Done adding cards");
