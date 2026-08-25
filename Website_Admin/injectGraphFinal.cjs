const fs = require('fs');

function injectFullGraphAndFollowups(f) {
  let c = fs.readFileSync(f, 'utf8');
  
  if (!c.includes('recharts')) {
    c = c.replace(
      'import { useAdminSettings }',
      'import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";\\nimport { useAdminSettings }'
    );
  }
  
  if (!c.includes('const [leads, setLeads] = useState([]);')) {
    c = c.replace(
      'const [loading, setLoading] = useState(true);',
      'const [loading, setLoading] = useState(true);\\n  const [leads, setLeads] = useState([]);'
    );
  }
  
  const fetchLeadsCode = "const fetchLeads = async () => { try { const res = await fetch(`${API_BASE}/api/bde/${bdeId}/leads`); const data = await res.json(); if (data.success) { setLeads(data.leads || []); } } catch (err) {} };";

  if (!c.includes('const fetchLeads = async')) {
    c = c.replace(
      'const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";',
      'const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";\\n  ' + fetchLeadsCode
    );
  }

  if (!c.includes('fetchLeads();')) {
    if (c.includes('fetchAustralianStats();')) {
      c = c.replace('fetchAustralianStats();', 'fetchAustralianStats();\\n    fetchLeads();');
    } else if (c.includes('fetchDashboardStats();')) {
      c = c.replace('fetchDashboardStats();', 'fetchDashboardStats();\\n    fetchLeads();');
    }
  }

  const sectionsToInject = "      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 mt-6\">\n        <div className=\"lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6\">\n          <h3 className=\"text-lg font-black text-slate-800 mb-4\">Leads vs Conversions (Last 7 Days)</h3>\n          <div className=\"h-64 w-full\">\n            <ResponsiveContainer width=\"100%\" height=\"100%\">\n              <LineChart \n                data={[...Array(7)].map((_, i) => {\n                  const d = new Date(); d.setDate(d.getDate() - (6-i));\n                  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });\n                  return {\n                    name: dateStr,\n                    Received: leads.filter(l => new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === dateStr).length,\n                    Converted: leads.filter(l => (l.tokenPaid || l.convertedProjectId) && new Date(l.updatedAt || l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === dateStr).length\n                  };\n                })} \n                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}\n              >\n                <CartesianGrid strokeDasharray=\"3 3\" stroke=\"#f1f5f9\" />\n                <XAxis dataKey=\"name\" tick={{fontSize: 12, fill: '#64748b'}} />\n                <YAxis tick={{fontSize: 12, fill: '#64748b'}} allowDecimals={false} />\n                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />\n                <Legend iconType=\"circle\" />\n                <Line type=\"monotone\" dataKey=\"Received\" stroke=\"#3b82f6\" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} />\n                <Line type=\"monotone\" dataKey=\"Converted\" stroke=\"#10b981\" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />\n              </LineChart>\n            </ResponsiveContainer>\n          </div>\n        </div>\n        <div className=\"bg-white rounded-2xl shadow-sm border border-slate-100 p-6\">\n          <h3 className=\"text-lg font-black text-slate-800 mb-4\">Leads by Project Type</h3>\n          <div className=\"space-y-3 max-h-64 overflow-y-auto\">\n            {Object.entries(leads.reduce((acc, l) => {\n              let pt = l.solarType || 'standard';\n              acc[pt] = (acc[pt] || 0) + 1;\n              return acc;\n            }, {})).map(([type, count], i) => (\n              <div key={i} className=\"flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100\">\n                <span className=\"font-bold text-slate-700 text-sm capitalize\">{type.replace(/-/g, ' ')}</span>\n                <span className=\"bg-blue-100 text-blue-700 font-black px-2.5 py-1 rounded-lg text-xs\">{count}</span>\n              </div>\n            ))}\n          </div>\n        </div>\n      </div>\n";
  
  const followUpsToInject = "      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6\">\n        <div className=\"bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden\">\n          <div className=\"p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50\">\n            <h3 className=\"font-bold text-gray-900 flex items-center gap-2\"><svg xmlns=\"http://www.w3.org/2000/svg\" className=\"w-4 h-4 text-orange-500\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/><polyline points=\"14.05 2 22 2 22 9.95\"/><line x1=\"14.05\" y1=\"2\" x2=\"22\" y2=\"9.95\"/></svg> Today's Follow-ups</h3>\n            <span className=\"px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full\">{stats.todaysFollowups || 0}</span>\n          </div>\n          <div className=\"p-0\">\n            {!stats.followupList || stats.followupList.length === 0 ? (\n              <div className=\"p-6 text-center text-gray-500 text-sm\">No follow-ups scheduled for today.</div>\n            ) : (\n              <ul className=\"divide-y divide-gray-100 max-h-64 overflow-y-auto\">\n                {stats.followupList.map(lead => (\n                  <li key={lead._id} className=\"p-4 hover:bg-gray-50 transition flex justify-between items-center\">\n                    <div>\n                      <p className=\"font-medium text-gray-900\">{lead.name}</p>\n                      <p className=\"text-xs text-gray-500\">{lead.mobile} {lead.email && <span className=\"ml-1 bg-gray-100 px-1 rounded\">{lead.email}</span>} - {lead.district}</p>\n                    </div>\n                    <span className=\"text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md\">{lead.status}</span>\n                  </li>\n                ))}\n              </ul>\n            )}\n          </div>\n        </div>\n\n        <div className=\"bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden\">\n          <div className=\"p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50\">\n            <h3 className=\"font-bold text-gray-900 flex items-center gap-2\"><MapPin className=\"w-4 h-4 text-blue-500\"/> Active Leads by District</h3>\n          </div>\n          <div className=\"p-4\">\n            {!stats.districtStats || stats.districtStats.length === 0 ? (\n              <div className=\"text-center text-gray-500 text-sm p-4\">No active leads assigned yet.</div>\n            ) : (\n              <div className=\"space-y-4 max-h-64 overflow-y-auto pr-2\">\n                {stats.districtStats.map(dist => (\n                  <div key={dist._id} className=\"flex items-center justify-between\">\n                    <span className=\"text-sm font-medium text-gray-700\">{dist._id || 'Unknown'}</span>\n                    <div className=\"flex items-center gap-3 w-1/2\">\n                      <div className=\"w-full bg-gray-100 rounded-full h-2\">\n                        <div className=\"bg-blue-500 h-2 rounded-full\" style={{ width: `${Math.min(100, (dist.count / (stats.totalAssigned || 1)) * 100)}%` }}></div>\n                      </div>\n                      <span className=\"text-sm font-bold text-gray-900 w-8 text-right\">{dist.count}</span>\n                    </div>\n                  </div>\n                ))}\n              </div>\n            )}\n          </div>\n        </div>\n      </div>\n";

  if (!c.includes('Leads vs Conversions')) {
    // Insert before the last </div>
    let lastDiv = c.lastIndexOf('</div>');
    if (lastDiv > -1) {
      c = c.substring(0, lastDiv) + sectionsToInject;
      if (!c.includes("Today's Follow-ups") || f.includes('BDEAustDashboard.jsx')) {
        c += followUpsToInject;
      }
      c += '\\n    </div>\\n  );\\n}\\n';
    }
  }

  fs.writeFileSync(f, c);
}

injectFullGraphAndFollowups('src/components/bde/BDEAustDashboard.jsx');
injectFullGraphAndFollowups('src/components/bde/BDEDashboard.jsx');
