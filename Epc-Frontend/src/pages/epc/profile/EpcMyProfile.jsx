import { useEffect, useState } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import { useCountry } from '../../../context/CountryContext';
import epcApi from '../../../api/epcApi';
import { TrustBadgeApplication } from './TrustBadgeApplication';
import { ShieldCheck } from 'lucide-react';

const PROJECT_TYPES = [
  'Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign',
  'Commercial Solar', 'Residential Solar',
];

const EpcMyProfile = () => {
  const { epc, updateEpcData } = useEpcAuth();
  const { getStates, locationsLoading } = useCountry();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState({ text: '', type: '' });
  const [form, setForm] = useState({
    companyName: '', ownerName: '', mobile: '',
    state: '', city: '', pincode: '', address: '', hqLocation: '',
    abn: '', cecAccreditationNumber: '', cecExpiryDate: '', cecLicenseUrl: ''
  });

  // Dynamic filter states
  const [filterType, setFilterType] = useState('');
  const [filterDist, setFilterDist] = useState('');
  const [showBrandConfig, setShowBrandConfig] = useState(false);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [brandOfferings, setBrandOfferings] = useState([]);
  
  // Trust Badge modal state
  const [showTrustBadgeModal, setShowTrustBadgeModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [profileRes, brandsRes] = await Promise.all([
        epcApi.get('/api/epc/auth/profile'),
        fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/brands?country=australia` : 'http://localhost:4005/api/brands?country=australia').then(r => r.json()).catch(() => ({ data: [] }))
      ]);
      const data = profileRes.data;
      setProfile(data);
      setBrandOfferings(data.brandOfferings || []);
      if (brandsRes?.success || brandsRes?.data) {
         setAvailableBrands(brandsRes.data || []);
      }
      setForm({
        companyName: data.companyName || '',
        ownerName:   data.ownerName   || '',
        mobile:      data.mobile      || '',
        state:       data.state       || '',
        city:        data.city        || '',
        pincode:     data.pincode     || '',
        address:     data.address     || '',
        hqLocation:  data.hqLocation  || '',
        abn:         data.kycDocuments?.abn || '',
        cecAccreditationNumber: data.kycDocuments?.cecAccreditationNumber || '',
        cecExpiryDate: data.kycDocuments?.cecExpiryDate ? data.kycDocuments.cecExpiryDate.split('T')[0] : '',
        cecLicenseUrl: data.kycDocuments?.cecLicenseUrl || '',
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        brandOfferings,
        kycDocuments: {
          abn: form.abn,
          cecAccreditationNumber: form.cecAccreditationNumber,
          cecExpiryDate: form.cecExpiryDate || null,
          cecLicenseUrl: form.cecLicenseUrl
        }
      };
      const { data } = await epcApi.put('/api/epc/auth/profile', payload);
      setMsg({ text: 'Profile updated successfully!', type: 'success' });
      updateEpcData({ companyName: data.companyName });
      setEditing(false);
      setShowBrandConfig(false);
      load();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    }
  };

  const handleSaveBrands = async () => {
    setSaving(true);
    try {
      const { data } = await epcApi.put('/api/epc/auth/profile', { brandOfferings });
      setMsg({ text: 'Brand offerings updated successfully!', type: 'success' });
      setShowBrandConfig(false);
      load();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Failed to update brand offerings', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    }
  };

  const clearFilters = () => {
    setFilterType('');
    setFilterDist('');
  };

  const inputCls = 'w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all';
  const filterSelectCls = 'bg-white border border-gray-200 text-gray-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 cursor-pointer transition-all';

  const planColors = {
    Standard:     { bg: 'bg-gray-100',  text: 'text-gray-700',   border: 'border-gray-200' },
    Professional: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
    Enterprise:   { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  };
  const planStyle = planColors[profile?.plan] || planColors.Standard;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">

      {/* ── PAGE HEADER ── */}
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white text-2xl font-black tracking-tight">My Profile</h2>
          <p className="text-slate-400 text-sm mt-1">Shown to customers when selecting you as their EPC partner</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-white text-gray-800 hover:bg-gray-50 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm">
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {msg.text && (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
          msg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg({ text: '', type: '' })} className="opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ── COMPANY HERO CARD ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-premium overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
        <div className="flex items-start gap-5 flex-wrap relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white text-2xl font-black">{profile?.companyName?.charAt(0)?.toUpperCase() || 'E'}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-gray-800 text-xl font-black">{profile?.companyName}</h3>
            <p className="text-gray-500 text-sm">{profile?.ownerName}</p>
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <span className={`status-pill ${planStyle.bg} ${planStyle.text} ${planStyle.border}`}>
                💼 {profile?.plan} Plan
              </span>
              <span className={`status-pill ${
                profile?.onboardingStatus === 'Verified'  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                profile?.onboardingStatus === 'Approved'  ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {profile?.onboardingStatus === 'Verified' ? '✅' : '⏳'} {profile?.onboardingStatus}
              </span>
              
              {profile?.trustBadge?.status === 'Approved' ? (
                <span className="status-pill bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-sm">
                  <ShieldCheck className="w-3 h-3 mr-1" /> TRUSTED
                </span>
              ) : profile?.trustBadge?.status === 'Pending' || profile?.trustBadge?.status === 'Applied' ? (
                <span className="status-pill bg-orange-50 text-orange-600 border-orange-200">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Badge Pending
                </span>
              ) : (
                <button
                  onClick={() => setShowTrustBadgeModal(true)}
                  className="status-pill bg-white text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors shadow-sm cursor-pointer">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Apply for Trust Badge
                </button>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex-shrink-0 text-center bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-5 py-4">
            <p className="text-amber-600 text-[10px] font-bold uppercase tracking-wider mb-1">Rating</p>
            <div className="flex items-center gap-0.5 justify-center mb-1">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className={`w-4 h-4 ${s <= Math.round(profile?.rating || 0) ? 'text-amber-400' : 'text-gray-200'}`}
                  fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <p className="text-amber-700 text-3xl font-black">{profile?.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-amber-500 text-[10px] font-medium">{profile?.totalRatings || 0} reviews</p>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '✅', label: 'On-Time %',      value: `${profile?.onTimeCompletionPercent ?? '—'}%`, grad: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-700' },
          { icon: '📍', label: 'Districts',        value: profile?.activeDistricts?.length || 0,         grad: 'from-blue-500 to-blue-600',    light: 'bg-blue-50 text-blue-700' },
          { icon: '🏆', label: 'Yrs Experience', value: `${profile?.yearsOfExperience || 0} yrs`,     grad: 'from-purple-500 to-purple-600', light: 'bg-purple-50 text-purple-700' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-premium hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.grad} flex items-center justify-center mx-auto mb-3 text-xl shadow-sm`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-black text-gray-800">{stat.value}</p>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter by</p>
          {(filterType || filterDist) && (
            <button onClick={clearFilters} className="text-xs text-red-500 font-semibold hover:text-red-700">✕ Clear</button>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">Project Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className={filterSelectCls}>
              <option value="">All Types</option>
              {PROJECT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">District</label>
            <select value={filterDist} onChange={e => setFilterDist(e.target.value)} className={filterSelectCls}>
              <option value="">All Districts</option>
              {(profile?.activeDistricts || epc?.activeDistricts || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── RATINGS BY PROJECT TYPE ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
        <h3 className="text-gray-800 font-black mb-4 flex items-center gap-2">
          <span className="text-xl">⭐</span> Ratings by Project Type
        </h3>
        <ProjectTypeRatings epcId={profile?._id} filterType={filterType} filterDist={filterDist} />
      </div>

      {/* ── INSTALLATION PHOTOS ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-800 font-black flex items-center gap-2">
            <span className="text-xl">📸</span> Recent Installation Photos
          </h3>
          <p className="text-gray-400 text-xs">From completed projects · visible to customers</p>
        </div>
        <RecentInstallationPhotos epcId={profile?._id} filterType={filterType} filterDist={filterDist} />
      </div>

      {/* ── CUSTOMER COMMENTS ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
        <h3 className="text-gray-800 font-black mb-4 flex items-center gap-2">
          <span className="text-xl">💬</span> Customer Comments
        </h3>
        <CustomerComments epcId={profile?._id} filterType={filterType} filterDist={filterDist} />
      </div>

      {/* ── EDIT FORM ── */}
      {editing && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-premium">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">✏️</div>
            <div>
              <h3 className="text-gray-800 font-black">Edit Company Information</h3>
              <p className="text-gray-400 text-xs">Changes will be visible to customers</p>
            </div>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">Company Name</label>
                <input type="text" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">Owner Name</label>
                <input type="text" value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">Mobile</label>
                <input type="tel" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} maxLength={10} className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">HQ Location</label>
                <input type="text" value={form.hqLocation} onChange={e => setForm({...form, hqLocation: e.target.value})} placeholder="e.g. Surat" className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">State</label>
                <select 
                  value={form.state} 
                  onChange={e => setForm({...form, state: e.target.value})} 
                  className={inputCls}
                  disabled={locationsLoading}
                >
                  <option value="">Select State</option>
                  {getStates(profile?.country || epc?.country).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  {/* Fallback if current state isn't in DB yet */}
                  {form.state && !getStates(profile?.country || epc?.country).includes(form.state) && (
                    <option value={form.state}>{form.state}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">City</label>
                <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">Pincode</label>
                <input type="text" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} maxLength={6} className={inputCls} />
              </div>
              <div className="col-span-full">
                <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">Address</label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} className={`${inputCls} resize-none`} />
              </div>

              {/* Australia Specific Fields */}
              {(profile?.country === 'australia' || epc?.country === 'australia') && (
                <div className="col-span-full bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="col-span-full mb-1">
                    <h4 className="text-gray-800 font-bold flex items-center gap-2">🇦🇺 Australia Specific Information</h4>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">ABN (For GST Invoices)</label>
                    <input type="text" value={form.abn} onChange={e => setForm({...form, abn: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">CEC Accreditation No.</label>
                    <input type="text" value={form.cecAccreditationNumber} onChange={e => setForm({...form, cecAccreditationNumber: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs mb-1.5 font-bold uppercase tracking-wider">CEC Expiry Date</label>
                    <input type="date" value={form.cecExpiryDate} onChange={e => setForm({...form, cecExpiryDate: e.target.value})} className={inputCls} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setEditing(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-3 rounded-xl transition-colors">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 text-white text-sm font-black py-3 rounded-xl transition-all shadow-md shadow-blue-100">
                {saving ? '⏳ Saving...' : '✔ Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── CONTACT + LOCATION (view mode) ── */}
      {!editing && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
            <h3 className="text-gray-800 font-black mb-4 flex items-center gap-2"><span className="text-lg">📞</span> Contact Info</h3>
            <div className="space-y-3">
              {[{ label: 'Email', value: profile?.email }, { label: 'Mobile', value: profile?.mobile }, { label: 'HQ Location', value: profile?.hqLocation }].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-400 text-xs font-medium">{item.label}</span>
                  <span className="text-gray-800 text-sm font-semibold">{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
            <h3 className="text-gray-800 font-black mb-4 flex items-center gap-2"><span className="text-lg">📍</span> Location</h3>
            <div className="space-y-3">
              {[{ label: 'State', value: profile?.state }, { label: 'City', value: profile?.city }, { label: 'Pincode', value: profile?.pincode }, { label: 'Address', value: profile?.address }].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-400 text-xs font-medium">{item.label}</span>
                  <span className="text-gray-800 text-sm font-semibold">{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Australia Compliance View */}
          {(profile?.country === 'australia' || epc?.country === 'australia') && (
            <div className="sm:col-span-2 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-5 shadow-premium">
              <h3 className="text-gray-800 font-black mb-4 flex items-center gap-2">
                <span className="text-lg">🇦🇺</span> Australia Compliance & Accreditations
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 sm:border-b-0 sm:border-r pr-4">
                  <span className="text-gray-400 text-xs font-medium">ABN</span>
                  <span className="text-gray-800 text-sm font-semibold">{profile?.kycDocuments?.abn || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 sm:border-b-0 sm:border-r pr-4 pl-0 sm:pl-4">
                  <span className="text-gray-400 text-xs font-medium">CEC Accreditation No.</span>
                  <span className="text-gray-800 text-sm font-semibold">{profile?.kycDocuments?.cecAccreditationNumber || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2 pl-0 sm:pl-4">
                  <span className="text-gray-400 text-xs font-medium">CEC Expiry Date</span>
                  <span className={`text-sm font-semibold ${
                    new Date(profile?.kycDocuments?.cecExpiryDate) < new Date() ? 'text-red-600' : 'text-gray-800'
                  }`}>
                    {profile?.kycDocuments?.cecExpiryDate 
                      ? new Date(profile.kycDocuments.cecExpiryDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) 
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ACTIVE DISTRICTS ── */}
      {profile?.activeDistricts?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-premium">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 font-black flex items-center gap-2"><span className="text-lg">🗺️</span> Active Districts</h3>
            <button onClick={() => setShowBrandConfig(true)}
              className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-3 py-2 rounded-xl font-bold transition-colors">
              🏷️ Configure Brands
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {profile.activeDistricts.map(d => (
              <span key={d} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200 font-semibold">📍 {d}</span>
            ))}
          </div>
        </div>
      )}

      {showBrandConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-gray-800 text-lg font-bold mb-4">Configure Brand Offerings</h3>
            <p className="text-gray-500 text-sm mb-6">Select which solar panels and inverters you offer in each active district.</p>
            
            <div className="space-y-6">
              {profile.activeDistricts.map(district => {
                const districtConfig = brandOfferings.find(b => b.district === district) || { district, solarBrands: [], inverterBrands: [] };
                return (
                  <div key={district} className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-700 mb-3">{district}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Solar Brands</p>
                        <div className="flex flex-wrap gap-2">
                          {availableBrands.filter(b => b.type === 'Solar').map(brand => {
                            const isSelected = districtConfig.solarBrands.includes(brand._id);
                            return (
                              <button key={brand._id} type="button"
                                onClick={() => {
                                  const updated = [...brandOfferings];
                                  let dIndex = updated.findIndex(b => b.district === district);
                                  if (dIndex === -1) {
                                    updated.push({ district, solarBrands: [], inverterBrands: [] });
                                    dIndex = updated.length - 1;
                                  }
                                  if (isSelected) {
                                    updated[dIndex].solarBrands = updated[dIndex].solarBrands.filter(id => id !== brand._id);
                                  } else {
                                    updated[dIndex].solarBrands.push(brand._id);
                                  }
                                  setBrandOfferings(updated);
                                }}
                                className={`text-xs px-3 py-1.5 rounded-full border ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                                {brand.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Inverter Brands</p>
                        <div className="flex flex-wrap gap-2">
                          {availableBrands.filter(b => b.type === 'Inverter').map(brand => {
                            const isSelected = districtConfig.inverterBrands.includes(brand._id);
                            return (
                              <button key={brand._id} type="button"
                                onClick={() => {
                                  const updated = [...brandOfferings];
                                  let dIndex = updated.findIndex(b => b.district === district);
                                  if (dIndex === -1) {
                                    updated.push({ district, solarBrands: [], inverterBrands: [] });
                                    dIndex = updated.length - 1;
                                  }
                                  if (isSelected) {
                                    updated[dIndex].inverterBrands = updated[dIndex].inverterBrands.filter(id => id !== brand._id);
                                  } else {
                                    updated[dIndex].inverterBrands.push(brand._id);
                                  }
                                  setBrandOfferings(updated);
                                }}
                                className={`text-xs px-3 py-1.5 rounded-full border ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                                {brand.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowBrandConfig(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleSaveBrands} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">{saving ? 'Saving...' : 'Save Configuration'}</button>
            </div>
          </div>
        </div>
      )}

      {showTrustBadgeModal && (
        <TrustBadgeApplication 
          epcData={profile} 
          onClose={() => setShowTrustBadgeModal(false)}
          onApplySuccess={() => {
            setShowTrustBadgeModal(false);
            load();
            setMsg({ text: 'Trust Badge applied successfully!', type: 'success' });
          }}
        />
      )}
    </div>
  );
};



// ── Project Type wise Ratings ──
const ProjectTypeRatings = ({ epcId, filterType, filterDist }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = new URLSearchParams();
        params.set('status', 'Completed');
        if (filterType) params.set('projectType', filterType);
        if (filterDist) params.set('district', filterDist);

        const { data } = await epcApi.get(`/api/epc/orders?${params}`);
        const orders = data.orders || data;

        const grouped = {};
        orders.forEach(o => {
          if (o.customerRating && o.projectType) {
            if (!grouped[o.projectType]) grouped[o.projectType] = { total: 0, count: 0 };
            grouped[o.projectType].total += o.customerRating;
            grouped[o.projectType].count += 1;
          }
        });

        const result = Object.entries(grouped).map(([type, { total, count }]) => ({
          type,
          avg: (total / count).toFixed(1),
          count,
        }));
        setRatings(result);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    if (epcId) fetch();
  }, [epcId, filterType, filterDist]);

  if (loading) return <p className="text-gray-400 text-sm">Loading ratings...</p>;

  if (ratings.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <p className="text-gray-400 text-sm">No ratings yet</p>
        <p className="text-gray-300 text-xs mt-1">No ratings match the selected filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ratings.map(r => (
        <div key={r.type} className="flex items-center gap-4">
          <p className="text-gray-600 text-sm w-48 truncate flex-shrink-0">{r.type}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {[1,2,3,4,5].map(s => (
              <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(r.avg) ? 'text-yellow-400' : 'text-gray-200'}`}
                fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <span className="text-gray-800 text-sm font-semibold">{r.avg}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
            <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${(r.avg / 5) * 100}%` }} />
          </div>
          <span className="text-gray-400 text-xs flex-shrink-0">{r.count} review{r.count !== 1 ? 's' : ''}</span>
        </div>
      ))}
    </div>
  );
};

// ── Recent Installation Photos ──
const RecentInstallationPhotos = ({ epcId, filterType, filterDist }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await epcApi.get('/api/epc/projects');
        const projectsList = data.projects || [];
        const allPhotos = [];

        projectsList.forEach(p => {
          if (filterType && p.projectType !== filterType) return;
          if (filterDist && (p.district !== filterDist && p.location?.district !== filterDist)) return;

          // Extract photos from completed steps or project evidence
          if (p.steps?.length) {
            p.steps.forEach(step => {
              if (step.evidenceUrl) {
                const fullUrl = step.evidenceUrl.startsWith('http') 
                  ? step.evidenceUrl 
                  : (import.meta.env.VITE_API_URL || 'http://localhost:4005') + step.evidenceUrl;
                
                allPhotos.push({
                  fileUrl: fullUrl,
                  customerName: p.customerName,
                  capacity: p.systemSizeKW || 6.6,
                  projectType: p.projectTypeLabel || p.projectType,
                  district: p.location?.city || p.district || 'Location',
                  stepTitle: step.title
                });
              }
            });
          }
        });

        setPhotos(allPhotos.slice(0, 6));
      } catch (err) {
        console.error("Error fetching photos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [epcId, filterType, filterDist]);

  if (loading) return <p className="text-gray-400 text-sm">Loading photos...</p>;

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-400 text-sm font-semibold">No installation photos yet</p>
        <p className="text-gray-400 text-xs mt-1">Upload proof photos during project step execution to display here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {photos.map((photo, i) => (
        <div key={i} className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-square group shadow-sm">
          <img src={photo.fileUrl} alt={photo.stepTitle} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 flex flex-col justify-end text-white">
            <p className="font-bold text-xs truncate">{photo.customerName}</p>
            <p className="text-[10px] text-amber-300 font-semibold">{photo.capacity} kW • {photo.projectType}</p>
            <p className="text-[9px] text-slate-300 truncate">{photo.district}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Customer Comments ──
const CustomerComments = ({ epcId, filterType, filterDist }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await epcApi.get('/api/epc/projects');
        const projectsList = data.projects || [];
        
        const ratedProjects = projectsList
          .filter(p => {
            if (p.customerRating <= 0 && !p.customerReviewComment) return false;
            if (filterType && p.projectType !== filterType) return false;
            if (filterDist && (p.district !== filterDist && p.location?.district !== filterDist)) return false;
            return true;
          })
          .map(p => ({
            customerName: p.customerName || 'Verified Customer',
            rating:       p.customerRating || 5,
            feedback:     p.customerReviewComment || 'Excellent installation service and quick completion!',
            projectType:  p.projectTypeLabel || p.projectType || 'Solar Installation',
            capacityKw:   p.systemSizeKW || 6.6,
            district:     p.location?.city || p.district || 'Location',
            ratedAt:      p.customerRatedAt || p.updatedAt,
            orderNumber:  p.orderNumber || 'SUN-PROJECT'
          }));

        setComments(ratedProjects);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [epcId, filterType, filterDist]);

  if (loading) return <p className="text-gray-400 text-sm">Loading ratings & comments...</p>;

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <p className="text-gray-400 text-sm font-semibold">No comments yet</p>
        <p className="text-gray-400 text-xs mt-1">Customer ratings and written reviews for your completed projects will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((c, i) => (
        <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-slate-800 text-sm font-black">{c.customerName}</p>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">{c.orderNumber}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">{c.capacityKw} kW • {c.projectType}</span>
                <span className="text-slate-400 text-xs font-medium">{c.district}</span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-0.5 justify-end">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className={`w-3.5 h-3.5 ${s <= (c.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                    fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              {c.ratedAt && (
                <p className="text-slate-400 text-[11px] font-medium mt-1">
                  {new Date(c.ratedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          <p className="text-slate-700 text-xs font-medium bg-white p-3 rounded-xl border border-slate-100 italic shadow-2xs">
            "{c.feedback}"
          </p>
        </div>
      ))}
    </div>
  );
};

export default EpcMyProfile;