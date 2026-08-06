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

const roleConfig = {
  Manager:     { cls: 'bg-purple-50 text-purple-700 border-purple-200', icon: '👔' },
  Installer:   { cls: 'bg-blue-50 text-blue-700 border-blue-200',       icon: '🔧' },
  SalesAgent:  { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '💼' },
  Support:     { cls: 'bg-amber-50 text-amber-700 border-amber-200',     icon: '🎧' },
};

const avatarColors = [
  'from-blue-500 to-blue-700', 'from-purple-500 to-purple-700',
  'from-emerald-500 to-emerald-700', 'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700', 'from-teal-500 to-teal-700',
];

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
      setMsg({ text: '✅ Team member added successfully!', type: 'success' });
      setShowForm(false);
      setForm({ name: '', email: '', mobile: '', password: '', role: 'Installer', assignedDistricts: [], assignedProjectTypes: [] });
      load();
    } catch (err) {
      setMsg({
        text: err.response?.data?.message || 'Failed to add member',
        type: 'error',
        code: err.response?.data?.code || ''
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ text: '', type: '', code: '' }), 6000);
    }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Remove ${name} from your team?`)) return;
    try {
      await epcApi.delete(`/api/epc/team/${id}`);
      setMsg({ text: '✅ Member removed', type: 'success' });
      load();
    } catch (error) {
      setMsg({ text: 'Failed to remove member', type: 'error' });
    } finally { setTimeout(() => setMsg({ text: '', type: '' }), 3000); }
  };

  const inputCls = 'w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all';

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ── */}
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white text-2xl font-black tracking-tight">My Team</h2>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? '...' : `${members.length} member${members.length !== 1 ? 's' : ''}`} · Manage team and capacity
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all ${
            showForm
              ? 'bg-white/20 text-white border border-white/30'
              : 'bg-white text-gray-800 hover:bg-gray-50 shadow-sm'
          }`}>
          {showForm ? '✕ Cancel' : '+ Add Member'}
        </button>
      </div>

      {/* ── MESSAGE ── */}
      {msg.text && (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
          msg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{msg.text}</span>
          {msg.code === 'CAPACITY_LIMIT_REACHED' && (
            <button
              onClick={() => { setShowForm(false); document.getElementById('capacity-manager-section')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="whitespace-nowrap px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 transition-colors">
              Upgrade Plan
            </button>
          )}
        </div>
      )}

      {/* ── CAPACITY DASHBOARD ── */}
      {myPlan && <TeamCapacityDashboard myPlan={myPlan} />}

      {/* ── ADD MEMBER FORM ── */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-premium">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <h3 className="text-gray-800 font-black">Add Team Member</h3>
              <p className="text-gray-400 text-xs">Fill in the details below</p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Amit Sharma" className={inputCls} required />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={inputCls}>
                  {ROLES.map(r => <option key={r} value={r}>{roleConfig[r]?.icon} {r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="amit@example.com" className={inputCls} required />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">Mobile *</label>
                <input type="tel" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})}
                  placeholder="9876543210" maxLength={10} className={inputCls} required />
              </div>
              <div className="col-span-full">
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Minimum 6 characters" className={inputCls} required />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 text-xs mb-2 font-bold uppercase tracking-wider">Assign Districts</label>
              {(epc?.activeDistricts || []).length === 0
                ? <p className="text-gray-400 text-xs bg-gray-50 rounded-xl p-3 border border-gray-200">No active districts assigned to your account yet.</p>
                : (
                  <div className="flex gap-2 flex-wrap">
                    {(epc?.activeDistricts || []).map(d => (
                      <button type="button" key={d} onClick={() => toggleArr('assignedDistricts', d)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                          form.assignedDistricts.includes(d)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                        }`}>{d}</button>
                    ))}
                  </div>
                )
              }
            </div>

            <div>
              <label className="block text-gray-500 text-xs mb-2 font-bold uppercase tracking-wider">Project Types</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_TYPES.map(p => (
                  <button type="button" key={p} onClick={() => toggleArr('assignedProjectTypes', p)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                      form.assignedProjectTypes.includes(p)
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
                    }`}>{p}</button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-3 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 text-white text-sm font-black py-3 rounded-xl transition-all shadow-md shadow-blue-100">
                {saving ? '⏳ Adding...' : '✔ Add Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MEMBERS GRID ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-premium">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-gray-700 font-bold text-lg mb-1">No Team Members Yet</h3>
          <p className="text-gray-400 text-sm">Click "Add Member" to build your installation team</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map((m, idx) => {
            const rc = roleConfig[m.role] || roleConfig.Support;
            const gradColor = avatarColors[idx % avatarColors.length];
            return (
              <div key={m._id} className="card-row p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradColor} flex items-center justify-center shadow-sm flex-shrink-0`}>
                      <span className="text-white text-base font-black">{m.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-gray-800 text-sm font-black">{m.name}</p>
                      <span className={`status-pill mt-0.5 ${rc.cls}`}>{rc.icon} {m.role}</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(m._id, m.name)}
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                    title="Remove member">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3">
                  <p className="text-gray-500 text-xs flex items-center gap-1.5">📧 {m.email}</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1.5">📱 {m.mobile}</p>
                </div>

                {m.assignedDistricts?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-3">
                    {m.assignedDistricts.map(d => (
                      <span key={d} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-semibold">{d}</span>
                    ))}
                  </div>
                )}
                {m.assignedProjectTypes?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {m.assignedProjectTypes.map(p => (
                      <span key={p} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">{p}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div id="capacity-manager-section">
        {myPlan && <TeamCapacityManager myPlan={myPlan} />}
      </div>
    </div>
  );
};

export default EpcMyTeam;