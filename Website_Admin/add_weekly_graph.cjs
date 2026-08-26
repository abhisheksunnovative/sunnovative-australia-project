const fs = require('fs');

// 1. Fix state in BDEAustDashboard.jsx to include last7Days
let austC = fs.readFileSync('src/components/bde/BDEAustDashboard.jsx', 'utf8');
austC = austC.replace(
  /todaysFollowups: data\.stats\.todaysFollowups \|\| 0,/g,
  'todaysFollowups: data.stats.todaysFollowups || 0,\n          last7Days: data.stats.last7Days || { leads: 0, conversions: 0 },'
);
austC = austC.replace(
  /todaysFollowups: 0,/g,
  'todaysFollowups: 0,\n          last7Days: { leads: 0, conversions: 0 },'
);
fs.writeFileSync('src/components/bde/BDEAustDashboard.jsx', austC);

// 2. Add the graph to both files
function addWeeklyGraph(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  const graphCode = `
      {/* 7 Days Performance Graph */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-6 mb-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Last 7 Days Performance
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={[
                { name: "Last 7 Days", Leads: stats.last7Days?.leads || 0, Conversions: stats.last7Days?.conversions || 0 }
              ]} 
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
              <Bar dataKey="Conversions" fill="#10b981" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
  `;

  // Insert it before {/* Detailed Sections with Graph */}
  const insertTarget = '{/* Detailed Sections with Graph */}';
  if (c.includes(insertTarget) && !c.includes('7 Days Performance Graph')) {
    c = c.replace(insertTarget, graphCode + '\n      ' + insertTarget);
    fs.writeFileSync(filePath, c);
  }
}

addWeeklyGraph('src/components/bde/BDEDashboard.jsx');
addWeeklyGraph('src/components/bde/BDEAustDashboard.jsx');
console.log("Added 7-Days graph to both dashboards!");
