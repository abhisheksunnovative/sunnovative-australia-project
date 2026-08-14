import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, Settings, RefreshCw, CheckCircle, AlertTriangle, Download, Trash2, Plus, Users, ArrowLeft, Map, Globe } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

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
  const [level, setLevel] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  const [countries, setCountries] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [stats, setStats] = useState(null);

  const [activeTab, setActiveTab] = useState('upload');
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (level === 2 && selectedCountry) fetchStates(selectedCountry.name);
  }, [level, selectedCountry]);

  useEffect(() => {
    if (level === 3 && activeTab === 'settings') fetchSettings();
  }, [level, activeTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/epc-bulk/stats`);
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCountries = async () => {
    setLoadingLocations(true);
    try {
      const res = await fetch(`${API_BASE}/api/countries`);
      const data = await res.json();
      if (data.success) setCountries(data.data.filter(c => c.isActive !== false));
    } catch (e) {
      console.error(e);
    }
    setLoadingLocations(false);
  };

  const fetchStates = async (countryName) => {
    setLoadingLocations(true);
    try {
      const res = await fetch(`${API_BASE}/api/districts/states?country=${countryName}`);
      const data = await res.json();
      if (data.success) setStatesList(data.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoadingLocations(false);
  };

  const fetchSettings = async () => {
    if (!selectedCountry) return;
    setLoadingSettings(true);
    try {
      const res = await fetch(`${API_BASE}/api/epc-bulk/settings?country=${selectedCountry.name}`);
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
        body: JSON.stringify({ country: selectedCountry.name, fields })
      });
      const data = await res.json();
      if (data.success) alert("Settings Saved Successfully");
      else alert("Error saving settings");
    } catch (e) {
      alert("Network Error");
    }
  };

  const handleDownloadTemplate = () => {
    const headers = fields.map(f => `${f.fieldName}${f.isMandatory ? ' *' : ''}`);
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `EPC_Bulk_Upload_Template_${selectedCountry?.name || 'Unknown'}.xlsx`);
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
    const fileName = uploadFile.name.toLowerCase();
    if (fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      alert("AI Document Scanning is required for PDFs and Word files. Please provide the AI API key as discussed in the plan to activate this feature!");
      return;
    }
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

        const cleanedData = json.map(row => {
          const newRow = {};
          Object.keys(row).forEach(key => {
            const cleanKey = key.replace(' *', '').trim();
            newRow[cleanKey] = row[key];
          });
          newRow.country = newRow.country || selectedCountry.name;
          newRow.state = newRow.state || selectedState;
          return newRow;
        });

        const res = await fetch(`${API_BASE}/api/epc-bulk/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leads: cleanedData, country: selectedCountry.name })
        });
        const result = await res.json();
        setUploadResult(result);
        if (result.success) fetchStats();
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

      {stats && (
        <div className="space-y-6 pb-6 border-b border-slate-200">
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
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm max-h-[300px] overflow-y-auto">
              <h3 className="font-bold text-slate-800 mb-4 sticky top-0 bg-white pb-2 border-b border-slate-100">Country Split</h3>
              {stats.byCountry?.map(c => (
                <div key={c._id} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-medium text-slate-600">{c._id || 'Unknown'}</span>
                  <span className="text-sm font-bold text-slate-800">{c.count}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm max-h-[300px] overflow-y-auto">
              <h3 className="font-bold text-slate-800 mb-4 sticky top-0 bg-white pb-2 border-b border-slate-100">State Split</h3>
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

      <div className="pt-2">
        {level === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500"/> Step 1: Select Target Country
            </h2>
            {loadingLocations ? (
              <p className="text-sm text-slate-500">Loading countries...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {countries.map(c => (
                  <div key={c.code} onClick={() => { setSelectedCountry(c); setLevel(2); }}
                    className="bg-white border-2 border-slate-100 rounded-2xl p-5 cursor-pointer hover:border-indigo-400 hover:shadow-lg transition-all group flex flex-col items-center justify-center gap-3">
                    {c.flag ? (
                       <img src={c.flag} alt={c.name} className="w-12 h-12 object-contain" />
                    ) : (
                       <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 font-bold text-lg">{c.code}</div>
                    )}
                    <p className="font-bold text-slate-700 text-sm group-hover:text-indigo-600">{c.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {level === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setLevel(1)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Map className="w-4 h-4 text-indigo-500"/> Step 2: Select State in {selectedCountry?.name}
                </h2>
              </div>
            </div>
            
            {loadingLocations ? (
              <p className="text-sm text-slate-500">Loading states for {selectedCountry?.name}...</p>
            ) : statesList.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200">No states found for this country in the active districts database.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {statesList.map(s => (
                  <div key={s} onClick={() => { setSelectedState(s); setLevel(3); }}
                    className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
                    <p className="font-bold text-slate-700 text-sm">{s}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {level === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <button onClick={() => setLevel(2)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Step 3: EPC Bulk Upload</h2>
                <p className="text-xs text-indigo-600 font-bold">Targeting: {selectedCountry?.name} &gt; {selectedState}</p>
              </div>
            </div>

            <div className="flex gap-4 border-b border-slate-200 mt-2">
              {[
                { id: 'upload', label: 'Bulk Upload', icon: <Upload className="w-4 h-4"/> },
                { id: 'settings', label: 'Template Settings', icon: <Settings className="w-4 h-4"/> },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`pb-3 px-2 flex items-center gap-2 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === t.id ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'upload' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                <div className="flex justify-end">
                  <button onClick={handleDownloadTemplate} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition">
                    <Download className="w-4 h-4" /> Download Template
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50">
                  <input type="file" id="file-upload" className="hidden" accept=".xlsx, .xls, .csv, .pdf, .doc, .docx" onChange={handleFileUpload} />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-10 h-10 text-indigo-400 mb-3" />
                    <span className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Choose file</span>
                    <span className="text-xs text-slate-500 mt-1">{uploadFile ? uploadFile.name : "or drag and drop CSV / Excel / PDF / Word"}</span>
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

            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800">Dynamic Field Configuration</h3>
                    <p className="text-xs text-slate-500">Configure CSV column headers for {selectedCountry?.name}</p>
                  </div>
                  <button onClick={fetchSettings} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200">
                    <RefreshCw className={`w-4 h-4 ${loadingSettings ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div>
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
          </div>
        )}
      </div>
    </div>
  );
};
