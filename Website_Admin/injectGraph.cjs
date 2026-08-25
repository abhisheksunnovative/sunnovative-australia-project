const fs = require('fs');

function injectGraph(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // 1. Add Recharts imports
  if (!code.includes('recharts')) {
    code = code.replace(
      'import { useAdminSettings }',
      'import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";\\nimport { useAdminSettings }'
    );
  }

  // 2. Add leads state
  if (!code.includes('const [leads, setLeads] = useState([]);')) {
    code = code.replace(
      'const [loading, setLoading] = useState(true);',
      'const [loading, setLoading] = useState(true);\\n  const [leads, setLeads] = useState([]);'
    );
  }
  
  // 3. Add fetchLeads function
  const fetchLeadsCode = \`
  const fetchLeads = async () => {
    try {
      const res = await fetch(\\\`\${API_BASE}/api/bde/\${bdeId}/leads\\\`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
      }
    } catch (err) {}
  };
\`;
  if (!code.includes('const fetchLeads = async')) {
    code = code.replace(
      'const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";',
      'const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";\\n' + fetchLeadsCode
    );
  }
  
  // 4. Call fetchLeads in useEffect
  if (!code.includes('fetchLeads();')) {
    if (code.includes('fetchAustralianStats();')) {
      code = code.replace('fetchAustralianStats();', 'fetchAustralianStats();\\n    fetchLeads();');
    } else if (code.includes('fetchDashboardStats();')) {
      code = code.replace('fetchDashboardStats();', 'fetchDashboardStats();\\n    fetchLeads();');
    }
  }

  // 5. Inject Graph JSX right before Today's Follow-ups
  const graphJSX = \`
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-black text-slate-800 mb-4">Leads vs Conversions (Last 7 Days)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={[...Array(7)].map((_, i) => {
                  const d = new Date(); d.setDate(d.getDate() - (6-i));
                  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return {
                    name: dateStr,
                    Received: leads.filter(l => new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === dateStr).length,
                    Converted: leads.filter(l => (l.tokenPaid || l.convertedProjectId) && new Date(l.updatedAt || l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === dateStr).length
                  };
                })} 
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="Received" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} />
                <Line type="monotone" dataKey="Converted" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-black text-slate-800 mb-4">Leads by Project Type</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(leads.reduce((acc, l) => {
              let pt = l.solarType || 'standard';
              acc[pt] = (acc[pt] || 0) + 1;
              return acc;
            }, {})).map(([type, count], i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700 text-sm capitalize">{type.replace(/-/g, ' ')}</span>
                <span className="bg-blue-100 text-blue-700 font-black px-2.5 py-1 rounded-lg text-xs">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
\`;

  if (!code.includes('Leads vs Conversions (Last 7 Days)')) {
    if (filePath.includes('BDEAustDashboard.jsx')) {
      // In BDEAust, we can put it right before the "Today's Follow-ups" container or PROJECT TYPES
      // It looks like BDEAust doesn't have "Today's Followups" right now because `git checkout` removed it!
      // WAIT! I need to re-add Today's Followups to BDEAustDashboard if it's missing!
      // I'll check that next.
    }
  }
  
  fs.writeFileSync(filePath, code);
}

injectGraph('src/components/bde/BDEAustDashboard.jsx');
injectGraph('src/components/bde/BDEDashboard.jsx');
