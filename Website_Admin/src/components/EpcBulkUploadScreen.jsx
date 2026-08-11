import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, Settings, RefreshCw, CheckCircle, AlertTriangle, Download, Trash2, Plus, Users, BarChart } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const EPC_CATEGORIES = ["Solar Installer", "EPC", "Distributor", "Channel Partner"];
const DEFAULT_FIELDS = [
  { fieldName: 'state', fieldLabel: 'State', isMandatory: false, dataType: 'string' },
  { fieldName: 'district', fieldLabel: 'District', isMandatory: true, dataType: 'string' },
  { fieldName: 'companyName', fieldLabel: 'Company Name', isMandatory: true, dataType: 'string' },
  { fieldName: 'contactPersonName', fieldLabel: 'Contact Person', isMandatory: false, dataType: 'string' },
  { fieldName: 'email', fieldLabel: 'Email', isMandatory: true, dataType: 'email' },
  { fieldName: 'mobile', fieldLabel: 'Mobile', isMandatory: true, dataType: 'phone' },
  { fieldName: 'projectTypes', fieldLabel: 'Project Types', isMandatory: false, dataType: 'string' },
  { fieldName: 'serviceAreas', fieldLabel: 'Service Areas', isMandatory: false, dataType: 'string' },
  { fieldName: 'epcType', fieldLabel: 'EPC/Solar Installer Type', isMandatory: false, dataType: 'string' },
  { fieldName: 'existingEpcStatus', fieldLabel: 'Existing EPC Status', isMandatory: false, dataType: 'string' },
];

export const EpcBulkUploadScreen = () => {
  const [activeTab, setActiveTab] = useState('upload');
  
  // Settings State
  const [settingsCountry, setSettingsCountry] = useState('India');
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Upload State
  const [uploadCountry, setUploadCountry] = useState('India');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Dashboard State
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'dashboard') fetchStats();
  }, [activeTab, settingsCountry]);

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch(`${API_BASE}/api/epc-bulk/settings?country=${settingsCountry}`);
      const data = await res.json();
      if (data.success && data.data) {
        setFields(data.data.fields?.length > 0 ? data.data.fields : DEFAULT_FIELDS);
      } else {
        setFields(DEFAULT_FIELDS);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingSettings(false);
  };

  const saveSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/epc-bulk/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: settingsCountry, fields })
      });
      const data = await res.json();
      if (data.success) alert("Settings Saved Successfully");
      else alert("Error saving settings");
    } catch (e) {
      alert("Network Error");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/epc-bulk/stats`);
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadTemplate = () => {
    // We use the fields configuration to generate the template
    const headers = fields.map(f => `${f.fieldName}${f.isMandatory ? ' *' : ''}`);
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `EPC_Bulk_Upload_Template_${uploadCountry}.xlsx`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
  };

  const handleDownloadErrorReport = () => {
    if (!uploadResult || !uploadResult.errors) return;
    
    const csvRows = [];
    csvRows.push(['Row Number', 'Error Message', 'Failed Record Details']);
    
    uploadResult.errors.forEach((err, index) => {
      const rowData = uploadResult.failedRows && uploadResult.failedRows[index] 
          ? JSON.stringify(uploadResult.failedRows[index]).replace(/,/g, ';').replace(/"/g, '""') 
          : '';
      csvRows.push([err.row, `"${err.message}"`, `"${rowData}"`]);
    });
    
    const csvString = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'epc_upload_errors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const processUpload = () => {
    if (!uploadFile) return alert("Please select a file first");
    setUploading(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (json.length === 0) {
          alert("File is empty");
          setUploading(false);
          return;
        }

        // Clean headers (remove ' *' from mandatory fields)
        const cleanedData = json.map(row => {
          const newRow = {};
          Object.keys(row).forEach(key => {
            const cleanKey = key.replace(' *', '').trim();
            newRow[cleanKey] = row[key];
          });
          newRow.country = newRow.country || uploadCountry;
          return newRow;
        });

        // Send to backend
        const res = await fetch(`${API_BASE}/api/epc-bulk/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leads: cleanedData, country: uploadCountry })
        });
        const result = await res.json();
        setUploadResult(result);
      } catch (err) {
        console.error(err);
        alert("Error parsing file");
      }
      setUploading(false);
    };
    reader.readAsArrayBuffer(uploadFile);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
          <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">EPC Bulk Onboarding</h1>
          <p className="text-xs text-slate-500">Upload existing EPC partners into the platform</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        {[
          { id: 'upload', label: 'Bulk Upload', icon: <Upload className="w-4 h-4"/> },
          { id: 'settings', label: 'Template Settings', icon: <Settings className="w-4 h-4"/> },
          { id: 'dashboard', label: 'Dashboard', icon: <BarChart className="w-4 h-4"/> },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`pb-3 px-2 flex items-center gap-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === t.id ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* --- UPLOAD TAB --- */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Target Country</label>
              <select value={uploadCountry} onChange={e => setUploadCountry(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="India">India</option>
                <option value="Australia">Australia</option>
                <option value="New Zealand">New Zealand</option>
              </select>
            </div>
            <button onClick={handleDownloadTemplate} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition">
              <Download className="w-4 h-4" /> Download Template
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50">
            <input type="file" id="file-upload" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-10 h-10 text-indigo-400 mb-3" />
              <span className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Choose file</span>
              <span className="text-xs text-slate-500 mt-1">{uploadFile ? uploadFile.name : "or drag and drop CSV / Excel"}</span>
            </label>
          </div>

          <button onClick={processUpload} disabled={uploading || !uploadFile}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold transition disabled:opacity-50">
            {uploading ? "Processing..." : "Import Data"}
          </button>

          {uploadResult && (
            <div className={`p-4 rounded-xl border ${uploadResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {uploadResult.success ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                <h3 className="font-bold text-slate-800">Upload Summary</h3>
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Processed: {uploadResult.total}</p>
              <p className="text-sm text-emerald-600 mb-1 font-semibold">Successfully Imported: {uploadResult.imported}</p>
              <p className="text-sm text-amber-600 mb-3 font-semibold">Duplicates Skipped: {uploadResult.duplicates}</p>
              
              {uploadResult.errors?.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-red-600 uppercase">Errors ({uploadResult.errors.length})</p>
                    <button onClick={handleDownloadErrorReport} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition">
                      <Download className="w-3 h-3" /> Error Report (CSV)
                    </button>
                  </div>
                  <ul className="text-xs text-slate-600 max-h-32 overflow-y-auto space-y-1">
                    {uploadResult.errors.map((e, i) => <li key={i}>Row {e.row}: {e.message}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- SETTINGS TAB --- */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Configure For Country</label>
              <select value={settingsCountry} onChange={e => setSettingsCountry(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="India">India</option>
                <option value="Australia">Australia</option>
                <option value="New Zealand">New Zealand</option>
              </select>
            </div>
            <button onClick={fetchSettings} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200">
              <RefreshCw className={`w-4 h-4 ${loadingSettings ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-3">Dynamic Field Configuration</h3>
            <div className="space-y-3">
              {fields.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input type="text" value={f.fieldName} onChange={e => {
                    const newFields = [...fields]; newFields[i].fieldName = e.target.value; setFields(newFields);
                  }} className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200" placeholder="DB Field Name (e.g. companyName)" />
                  
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={f.isMandatory} onChange={e => {
                      const newFields = [...fields]; newFields[i].isMandatory = e.target.checked; setFields(newFields);
                    }} className="w-4 h-4 rounded text-indigo-600" /> Mandatory
                  </label>
                  
                  <button onClick={() => {
                    setFields(fields.filter((_, idx) => idx !== i));
                  }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setFields([...fields, { fieldName: '', fieldLabel: '', isMandatory: false, dataType: 'string' }])}
              className="mt-4 flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-2 rounded-xl transition">
              <Plus className="w-4 h-4" /> Add Field
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button onClick={saveSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition">
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* --- DASHBOARD TAB --- */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center"><Users className="w-6 h-6 text-blue-500"/></div>
              <div><p className="text-sm font-semibold text-slate-500">Total Uploaded</p><p className="text-2xl font-black text-slate-800">{stats.total}</p></div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-500"/></div>
              <div><p className="text-sm font-semibold text-slate-500">Active (Claimed)</p><p className="text-2xl font-black text-slate-800">{stats.active}</p></div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-amber-500"/></div>
              <div><p className="text-sm font-semibold text-slate-500">Pending Activation</p><p className="text-2xl font-black text-slate-800">{stats.pending}</p></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Country Split</h3>
              {stats.byCountry?.map(c => (
                <div key={c._id} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-medium text-slate-600">{c._id || 'Unknown'}</span>
                  <span className="text-sm font-bold text-slate-800">{c.count}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">State Split</h3>
              {stats.byState?.map(s => (
                <div key={s._id} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-medium text-slate-600">{s._id || 'Unknown'}</span>
                  <span className="text-sm font-bold text-slate-800">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
