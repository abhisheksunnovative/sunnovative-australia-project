const fs = require('fs');

function addDetailedSectionsAndGraph(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // Add Recharts import if missing
  if (!c.includes('BarChart, Bar')) {
    c = c.replace(
      'import { useAdminSettings }',
      'import { useAdminSettings }\nimport { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";'
    );
  }

  // Define the detailed sections with the graph
  const detailedSectionsCode = `
      {/* Detailed Sections with Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Today's Follow-ups */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><PhoneForwarded className="w-4 h-4 text-orange-500"/> Today's Follow-ups</h3>
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
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500"/> Active Leads by Region (Graph)</h3>
          </div>
          <div className="p-4 flex-1 min-h-[300px]">
            {!stats.districtStats || stats.districtStats.length === 0 ? (
              <div className="text-center text-gray-500 text-sm p-4 h-full flex items-center justify-center">No regional lead data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
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

  // For BDEDashboard, replace the existing Detailed Sections
  if (filePath.includes('BDEDashboard.jsx')) {
    const startIdx = c.indexOf('{/* Detailed Sections */}');
    if (startIdx !== -1) {
      const endIdx = c.lastIndexOf('</div>\n    </div>\n  );\n}');
      if (endIdx !== -1) {
        c = c.substring(0, startIdx) + detailedSectionsCode + '\n    </div>\n  );\n}';
      }
    }
  } 
  // For BDEAustDashboard, insert before the closing div
  else if (filePath.includes('BDEAustDashboard.jsx')) {
    // Check if it already has it to avoid duplicates
    if (!c.includes('{/* Detailed Sections with Graph */}')) {
      const closingIdx = c.lastIndexOf('</div>\n  );\n}');
      if (closingIdx !== -1) {
        c = c.substring(0, closingIdx) + detailedSectionsCode + '\n    </div>\n  );\n}';
      }
    }
  }

  fs.writeFileSync(filePath, c);
}

addDetailedSectionsAndGraph('src/components/bde/BDEDashboard.jsx');
addDetailedSectionsAndGraph('src/components/bde/BDEAustDashboard.jsx');
console.log("Added Graphs and Detailed Sections to both dashboards!");
