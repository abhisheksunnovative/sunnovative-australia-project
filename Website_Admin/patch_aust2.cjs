const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDEAustDashboard.jsx', 'utf8');

const detailedSectionsCode = `
      {/* Detailed Sections with Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Today's Follow-ups */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><polyline points="14 1 20 7 14 13"/><line x1="10" y1="14" x2="20" y2="7"/></svg>
              Today's Follow-ups
            </h3>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">{stats.todaysFollowups || 0}</span>
          </div>
          <div className="p-0">
            {!stats.followupList || stats.followupList.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No follow-ups scheduled for today.</div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {stats.followupList.map(lead => (
                  <li key={lead._id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.mobile} {lead.email && <span className="ml-1 bg-gray-100 px-1 rounded">{lead.email}</span>} - {lead.district || lead.suburb}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">{lead.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* District-wise Lead Status Graph */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Active Leads by Region (Graph)
            </h3>
          </div>
          <div className="p-4 flex-1 min-h-[300px]">
            {!stats.districtStats || stats.districtStats.length === 0 ? (
              <div className="text-center text-gray-500 text-sm p-4 h-full flex items-center justify-center">No regional lead data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.districtStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} name="Active Leads" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
`;

if (!c.includes('{/* Detailed Sections with Graph */}')) {
  // Find the exact place to inject: before the last two closing divs and closing brace
  c = c.replace(/    <\/div>\s*<\/div>\s*\);\s*}\s*$/, '    </div>\n' + detailedSectionsCode + '\n    </div>\n  );\n}\n');
  fs.writeFileSync('src/components/bde/BDEAustDashboard.jsx', c);
  console.log("Successfully patched BDEAustDashboard with detailed sections.");
} else {
  console.log("Detailed sections already present in BDEAustDashboard.");
}
