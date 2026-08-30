import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Key, MapPin, Save, AlertCircle, FileText, CheckCircle, ExternalLink, UploadCloud, Clock } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const DEFAULT_DOCS = [
  { id: "Aadhar Card",          required: true  },
  { id: "PAN Card",             required: true  },
  { id: "Bank Passbook / Cheque", required: true  },
  { id: "Passport Photo",       required: true  },
  { id: "Freelancer Agreement", required: false },
  { id: "GST Certificate",      required: false },
];

import DocViewerModal from "../shared/DocViewerModal";

export default function BDEProfile({ bdeId }) {
  const [bde, setBde] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Doc upload state
  const [uploading, setUploading] = useState(null);
  const [docError, setDocError] = useState('');
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => { fetchProfile(); }, [bdeId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bde/${bdeId}`);
      const data = await res.json();
      if (data.success) setBde(data.bde || data.data);
    } catch (e) { console.error("Failed to fetch profile", e); }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError(''); setPassSuccess('');
    if (newPassword !== confirmPassword) return setPassError("Passwords do not match.");
    if (newPassword.length < 6) return setPassError("Password must be at least 6 characters.");
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/bde/${bdeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setPassSuccess("Password updated successfully!");
        setNewPassword(''); setConfirmPassword('');
      } else setPassError(data.message || "Failed to update password");
    } catch (e) { setPassError("Server error. Try again."); }
    setSaving(false);
  };

  const handleDocUpload = async (docName, file) => {
    if (!file) return;
    setUploading(docName);
    setDocError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docName', docName);
      const res = await fetch(`${API_BASE}/api/bde/${bdeId}/onboarding-docs`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setBde(prev => ({ ...prev, onboardingDocs: data.onboardingDocs }));
      } else {
        setDocError(data.message || 'Upload failed');
      }
    } catch (e) {
      setDocError('Upload failed. Check your connection.');
    }
    setUploading(null);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading profile...</div>;
  if (!bde) return <div className="p-8 text-center text-red-500 font-medium">Failed to load profile data.</div>;

  const getDocStatus = (docName) => bde.onboardingDocs?.find(d => d.docName === docName);
  const uploadedCount = DEFAULT_DOCS.filter(d => getDocStatus(d.id)).length;
  const totalDocs = DEFAULT_DOCS.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
        <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0">
          <User className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{bde.name}</h1>
          <p className="text-slate-500 font-medium">{bde.bdeType} BDE &bull; {bde.assignedCountries?.join(", ").toUpperCase()}</p>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <Mail className="w-3.5 h-3.5" /> {bde.email}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <Phone className="w-3.5 h-3.5" /> {bde.mobile || "N/A"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase">
              <CheckCircle className="w-3.5 h-3.5" /> Active
            </span>
          </div>
        </div>
      </div>

            {/* Assignment Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
          <h2 className="font-black text-slate-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-500" /> My Assignment Details
          </h2>
          <p className="text-xs text-slate-500 mt-1">Regions, Project Types, and parameters assigned by the Admin.</p>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Countries</p>
            <p className="font-black text-slate-800 text-sm mt-0.5">{bde.assignedCountries?.join(", ") || 'All'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned States</p>
            <p className="font-black text-slate-800 text-sm mt-0.5">{bde.assignedStates?.join(", ") || 'All'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Regions / Territories</p>
            <p className="font-black text-slate-800 text-sm mt-0.5">{bde.assignedRegions?.join(", ") || 'All'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Districts</p>
            <p className="font-black text-slate-800 text-sm mt-0.5">{bde.assignedDistricts?.join(", ") || 'All'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Pincodes</p>
            <p className="font-black text-slate-800 text-sm mt-0.5 truncate">{bde.assignedPincodes?.join(", ") || 'All'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Project Types</p>
            <p className="font-black text-slate-800 text-sm mt-0.5">{bde.assignedProjectTypes?.map(pt => pt.replace(/-/g, ' ').toUpperCase()).join(", ") || 'All'}</p>
          </div>
        </div>
      </div>

      {/* KYC Documents Upload */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> My Documents (KYC Onboarding)
            </h2>
            <p className="text-xs text-slate-500 mt-1">Upload your documents for admin verification. ({uploadedCount}/{totalDocs} uploaded)</p>
          </div>
          <div className={`text-xs font-black px-3 py-1 rounded-full ${uploadedCount === totalDocs ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
            {uploadedCount === totalDocs ? '✓ All Uploaded' : `${uploadedCount}/${totalDocs} Done`}
          </div>
        </div>

        {docError && (
          <div className="mx-5 mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4" /> {docError}
          </div>
        )}

        <div className="p-5 space-y-3">
          {DEFAULT_DOCS.map(doc => {
            const status = getDocStatus(doc.id);
            const isUploading = uploading === doc.id;
            return (
              <div key={doc.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${status?.verified ? 'bg-emerald-50 border-emerald-200' : status ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${status?.verified ? 'bg-emerald-100' : status ? 'bg-blue-100' : 'bg-white border border-slate-200'}`}>
                    {status?.verified ? <CheckCircle className="w-5 h-5 text-emerald-600"/> : status ? <Clock className="w-5 h-5 text-blue-500"/> : <FileText className="w-5 h-5 text-slate-400"/>}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{doc.id} {doc.required && <span className="text-[10px] text-red-500 font-bold uppercase ml-1">Required</span>}</p>
                    {status?.verified && <p className="text-xs text-emerald-600 font-semibold">✓ Approved by Admin</p>}
                    {status && !status.verified && <p className="text-xs text-blue-500 font-semibold">⏳ Pending Admin Review</p>}
                    {status && <p className="text-[10px] text-slate-400 mt-0.5">{status.fileUrl?.split('/').pop()}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status?.fileUrl && (
                    <button onClick={() => setViewingDoc(status)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition">
                      <ExternalLink className="w-4 h-4"/>
                    </button>
                  )}
                  <label className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${isUploading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : status ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    <UploadCloud className="w-3.5 h-3.5"/>
                    {isUploading ? 'Uploading...' : status ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={isUploading}
                      onChange={e => handleDocUpload(doc.id, e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
          <h2 className="font-black text-slate-800 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" /> Change Password
          </h2>
          <p className="text-xs text-slate-500 mt-1">Update your account access password.</p>
        </div>
        <form onSubmit={handleChangePassword} className="p-5 space-y-4">
          {passError && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4" /> {passError}
            </div>
          )}
          {passSuccess && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-100">
              <CheckCircle className="w-4 h-4" /> {passSuccess}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
              placeholder="Enter new password" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
              placeholder="Confirm new password" required />
          </div>
          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {viewingDoc && <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
    </div>
  );
}
