import { useEffect, useState } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';
import { TrustBadgeApplication } from './TrustBadgeApplication';
import { ShieldCheck } from 'lucide-react';

const PROJECT_TYPES = [
  'Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign',
  'Commercial Solar', 'Residential Solar',
];

const EpcMyProfile = () => {
  const { epc, updateEpcData } = useEpcAuth();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState({ text: '', type: '' });
  const [form, setForm] = useState({
    companyName: '', ownerName: '', mobile: '',
    state: '', city: '', pincode: '', address: '', hqLocation: '',
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
      const { data } = await epcApi.put('/api/epc/auth/profile', { ...form, brandOfferings });
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

  const inputCls = 'w-full bg-white border border-gray-300 text-gray-800 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500';
  
  // Clean, visible layout structure matched with image_588ef9.png
  const filterSelectCls = 'w-48 bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer';

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
    <div className="space-y-5 w-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 text-xl font-bold">My Profile</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Shown to customers when selecting EPC partner for installation
          </p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {msg.text && (
        <div className={`text-sm rounded-lg px-4 py-3 border ${
          msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>{msg.text}</div>
      )}

      {/* ── Company Header Card ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-2xl font-bold">
              {profile?.companyName?.charAt(0)?.toUpperCase() || 'E'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-gray-800 text-xl font-bold">{profile?.companyName}</h3>
            <p className="text-gray-500 text-sm">{profile?.ownerName}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${planStyle.bg} ${planStyle.text} ${planStyle.border}`}>
                {profile?.plan} Plan
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                profile?.onboardingStatus === 'Verified'  ? 'bg-green-50 text-green-700 border-green-200' :
                profile?.onboardingStatus === 'Approved'  ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-yellow-50 text-yellow-700 border-yellow-200'
              }`}>
                {profile?.onboardingStatus}
              </span>
              
              {/* Trust Badge Status/Action */}
              {profile?.trustBadge?.status === 'Approved' ? (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> TRUSTED
                </span>
              ) : profile?.trustBadge?.status === 'Pending' || profile?.trustBadge?.status === 'Applied' ? (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-orange-50 text-orange-600 border border-orange-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Badge Pending
                </span>
              ) : (
                <button 
                  onClick={() => setShowTrustBadgeModal(true)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Apply for Trust Badge
                </button>
              )}
            </div>
          </div>

          {/* Overall Rating */}
          <div className="flex-shrink-0 text-center bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3">
            <p className="text-yellow-600 text-xs font-medium mb-1">Overall Rating</p>
            <div className="flex items-center gap-0.5 justify-center mb-1">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className={`w-4 h-4 ${s <= Math.round(profile?.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}
                  fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <p className="text-yellow-700 text-2xl font-bold">{profile?.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-yellow-600 text-xs">{profile?.totalRatings || 0} ratings</p>
          </div>
        </div>
      </div>

      {/* ── Stats Row: On-time %, Districts, Experience ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-green-600">{profile?.onTimeCompletionPercent ?? '—'}%</p>
          <p className="text-gray-500 text-xs mt-0.5">Project Completion On Time</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-blue-600">{profile?.activeDistricts?.length || 0}</p>
          <p className="text-gray-500 text-xs mt-0.5">Active Districts</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-purple-600">{profile?.yearsOfExperience || 0}</p>
          <p className="text-gray-500 text-xs mt-0.5">Years Experience</p>
        </div>
      </div>

      {/* ── Clean UI Filter Box (Matched with image_588ef9.png layout structure) ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="block text-gray-500 text-xs mb-1 font-medium">Project Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className={filterSelectCls}>
              <option value="">All Types</option>
              {PROJECT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1 font-medium">District</label>
            <select value={filterDist} onChange={e => setFilterDist(e.target.value)} className={filterSelectCls}>
              <option value="">All Districts</option>
              {(profile?.activeDistricts || epc?.activeDistricts || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {(filterType || filterDist) && (
            <button onClick={clearFilters} className="text-xs text-red-500 border border-red-200 bg-red-50 px-3 py-2 rounded-lg self-end mt-4 transition-all hover:bg-red-100">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Project Type wise Ratings ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Ratings by Project Type
        </h3>
        <ProjectTypeRatings epcId={profile?._id} filterType={filterType} filterDist={filterDist} />
      </div>

      {/* ── Recent Installation Photos ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 text-sm font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Recent Installation Photos
          </h3>
          <p className="text-gray-400 text-xs">From completed projects · shown to customers</p>
        </div>
        <RecentInstallationPhotos epcId={profile?._id} filterType={filterType} filterDist={filterDist} />
      </div>

      {/* Customer Comments */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Customer Comments
        </h3>
        <CustomerComments epcId={profile?._id} filterType={filterType} filterDist={filterDist} />
      </div>

      {/* ── Edit Form ── */}
      {editing && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-gray-700 font-semibold mb-4">Edit Company Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 text-xs mb-1">Company Name</label>
                <input type="text" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">Owner Name</label>
                <input type="text" value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">Mobile</label>
                <input type="tel" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} maxLength={10} className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">HQ Location</label>
                <input type="text" value={form.hqLocation} onChange={e => setForm({...form, hqLocation: e.target.value})} placeholder="e.g. Surat" className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">State</label>
                <input type="text" value={form.state} onChange={e => setForm({...form, state: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">City</label>
                <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">Pincode</label>
                <input type="text" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} maxLength={6} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-600 text-xs mb-1">Address</label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} className={`${inputCls} resize-none`} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Contact + Location (view mode) ── */}
      {!editing && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-gray-700 text-sm font-semibold mb-3">Contact Info</h3>
            <div className="space-y-2.5">
              <div><p className="text-gray-400 text-xs">Email</p><p className="text-gray-800 text-sm">{profile?.email}</p></div>
              <div><p className="text-gray-400 text-xs">Mobile</p><p className="text-gray-800 text-sm">{profile?.mobile || '—'}</p></div>
              <div><p className="text-gray-400 text-xs">HQ Location</p><p className="text-gray-800 text-sm">{profile?.hqLocation || '—'}</p></div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-gray-700 text-sm font-semibold mb-3">Location</h3>
            <div className="space-y-2.5">
              <div><p className="text-gray-400 text-xs">State</p><p className="text-gray-800 text-sm">{profile?.state || '—'}</p></div>
              <div><p className="text-gray-400 text-xs">City</p><p className="text-gray-800 text-sm">{profile?.city || '—'}</p></div>
              <div><p className="text-gray-400 text-xs">Address</p><p className="text-gray-800 text-sm">{profile?.address || '—'}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Active districts */}
      {profile?.activeDistricts?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-700 text-sm font-semibold">Active Districts</p>
            <button onClick={() => setShowBrandConfig(true)}
              className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg font-medium transition-colors">
              Configure Brand Offerings
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {profile.activeDistricts.map(d => (
              <span key={d} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200">{d}</span>
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