import { useEffect, useState } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';
import TeamCapacityManager from '../plan/TeamCapacityManager';
import TeamCapacityDashboard from './TeamCapacityDashboard';

const PROJECT_TYPES = [
  'Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign',
  'Commercial Solar', 'Residential Solar',
];
const ROLES = ['Manager', 'Installer', 'SalesAgent', 'Support'];

const STATES_AND_DISTRICTS = {
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi"]
};

const getDistrictState = (districtName) => {
  for (const [state, districts] of Object.entries(STATES_AND_DISTRICTS)) {
    if (districts.includes(districtName)) return state;
  }
  return 'Other';
};

const EpcMyTeam = () => {
  const { epc } = useEpcAuth();
  const [members, setMembers]   = useState([]);
  const [myPlan, setMyPlan]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState({ text: '', type: '', code: '' });
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', password: '',
    role: 'Installer', assignedDistricts: [], assignedProjectTypes: [],
  });

  const load = async () => {
    setLoading(true);
    try {
      const [teamRes, myRes] = await Promise.all([
        epcApi.get('/api/epc/team'),
        epcApi.get('/api/epc/plans/my-plan'),
      ]);
      setMembers(teamRes.data);
      setMyPlan(myRes.data);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleArr = (field, val) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val],
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await epcApi.post('/api/epc/team', form);
      setMsg({ text: 'Team member added!', type: 'success' });
      setShowForm(false);
      setForm({ name: '', email: '', mobile: '', password: '', role: 'Installer', assignedDistricts: [], assignedProjectTypes: [] });
      load();
    } catch (err) {
      setMsg({ 
        text: err.response?.data?.message || 'Failed to add', 
        type: 'error',
        code: err.response?.data?.code || ''
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ text: '', type: '', code: '' }), 6000);
    }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Remove ${name} from team?`)) return;
    try {
      await epcApi.delete(`/api/epc/team/${id}`);
      setMsg({ text: 'Member removed', type: 'success' });
      load();
    } catch (error) {
      console.error('Remove error:', error);
      setMsg({ text: 'Failed to remove', type: 'error' });
    } finally { setTimeout(() => setMsg({ text: '', type: '' }), 3000); }
  };

  const inputCls = 'w-full bg-white border border-gray-300 text-gray-800 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 text-xl font-bold">My Team & Capacity</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage team members and view your state-wise capacity</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </button>
      </div>

      {msg.text && (
        <div className={`text-sm rounded-lg px-4 py-3 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
          msg.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{msg.text}</span>
          {msg.code === 'CAPACITY_LIMIT_REACHED' && (
            <button 
              onClick={() => {
                setShowForm(false);
                document.getElementById('capacity-manager-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="whitespace-nowrap px-3 py-1.5 bg-red-600 text-white rounded-md font-bold text-xs hover:bg-red-700 transition-colors"
            >
              Upgrade Plan
            </button>
          )}
        </div>
      )}

      {/* OVERALL STATS SECTION */}
      {myPlan && <TeamCapacityDashboard myPlan={myPlan} />}

      {/* Add form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-gray-800 font-semibold mb-4">Add Team Member</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 text-xs mb-1">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Amit Sharma" className={inputCls} required />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={inputCls}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="amit@abc.com" className={inputCls} required />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">Mobile *</label>
                <input type="tel" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})}
                  placeholder="9876543210" maxLength={10} className={inputCls} required />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-600 text-xs mb-1">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Min 6 characters" className={inputCls} required />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 text-xs mb-2">Assign Districts</label>
              <div className="flex gap-2 flex-wrap">
                {(epc?.activeDistricts || []).map(d => (
                  <button type="button" key={d} onClick={() => toggleArr('assignedDistricts', d)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      form.assignedDistricts.includes(d)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400'
                    }`}>{d}</button>
                ))}
                {!epc?.activeDistricts?.length && (
                  <p className="text-gray-400 text-xs">No active districts assigned yet</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-600 text-xs mb-2">Project Types</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_TYPES.map(p => (
                  <button type="button" key={p} onClick={() => toggleArr('assignedProjectTypes', p)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      form.assignedProjectTypes.includes(p)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-500 border-gray-300 hover:border-green-400'
                    }`}>{p}</button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                {saving ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-400">No team members yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map(m => (
            <div key={m._id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm font-bold">{m.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-gray-800 text-sm font-semibold">{m.name}</p>
                    <p className="text-gray-500 text-xs">{m.role}</p>
                  </div>
                </div>
                <button onClick={() => handleRemove(m._id, m.name)}
                  className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-gray-500 text-xs">📧 {m.email}</p>
                <p className="text-gray-500 text-xs">📱 {m.mobile}</p>
                {m.assignedDistricts?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {m.assignedDistricts.map(d => (
                      <span key={d} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200">{d}</span>
                    ))}
                  </div>
                )}
                {m.assignedProjectTypes?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {m.assignedProjectTypes.map(p => (
                      <span key={p} className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-200">{p}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div id="capacity-manager-section">
        {myPlan && <TeamCapacityManager myPlan={myPlan} />}
      </div>
    </div>
  );
};

export default EpcMyTeam;