import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Check, X, Globe, ArrowLeft, Building2, Upload, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4005';

export default function BillTemplateManagementScreen() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);  // NEW: state selection step
  const [states, setStates] = useState([]);                   // NEW: states list
  const [templates, setTemplates] = useState([]);
  const [discoms, setDiscoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statesLoading, setStatesLoading] = useState(false);  // NEW
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // FIX 1: Correct the API URL from /api/bill-templates/ to /api/v2/bill-templates/
  const handleScanSampleBill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    const fd = new FormData();
    fd.append('billFile', file);

    try {
      const res = await fetch(`${API_URL}/api/v2/bill-templates/auto-generate`, {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          OCR_aliases_json: JSON.stringify(data.data, null, 2)
        }));
        alert("✅ Aliases auto-extracted successfully!");
      } else {
        alert(data.message || "Failed to scan bill");
      }
    } catch (err) {
      console.error(err);
      alert("Error scanning bill");
    } finally {
      setIsScanning(false);
    }
  };

  const [formData, setFormData] = useState({
    discom_id: '',
    consumer_type: 'Residential',
    version: '',
    active: true,
    OCR_aliases_json: '{\n  "consumer_number": ["Account No"],\n  "units_consumed": ["Units"],\n  "total_bill": ["Net Payable"]\n}'
  });

  // 1. Fetch Countries on Mount
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/countries`);
      const data = await res.json();
      const countryList = data.success ? data.data : (Array.isArray(data) ? data : []);
      setCountries(countryList.filter(c => c.isActive !== false));
    } catch (err) {
      console.error('Error fetching countries:', err);
    } finally {
      setLoading(false);
    }
  };

  // FIX 2: When a country is selected, fetch its states
  const handleSelectCountry = async (countryName) => {
    setSelectedCountry(countryName);
    setSelectedState(null);
    setStates([]);
    setStatesLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/districts/states?country=${countryName.toLowerCase()}`);
      const data = await res.json();
      const stateList = data.success ? data.data : (Array.isArray(data) ? data : []);
      setStates(stateList);
    } catch (err) {
      console.error('Error fetching states:', err);
      setStates([]);
    } finally {
      setStatesLoading(false);
    }
  };

  // 2. Fetch Templates and Discoms when a State is selected
  const handleSelectState = async (stateName) => {
    setSelectedState(stateName);
    fetchCountryStateData(selectedCountry, stateName);
  };

  const fetchCountryStateData = async (countryName, stateName) => {
    setLoading(true);
    try {
      const [tempRes, discRes] = await Promise.all([
        fetch(`${API_URL}/api/v2/bill-templates`),
        fetch(`${API_URL}/api/discoms?country=${countryName}`)
      ]);
      const tempJson = await tempRes.json();
      const discJson = await discRes.json();

      const allTemplates = tempJson.data || [];
      let countryDiscoms = [];
      if (discJson && Array.isArray(discJson.data)) {
        countryDiscoms = discJson.data;
      } else if (Array.isArray(discJson)) {
        countryDiscoms = discJson;
      }

      // Filter discoms by state if they have state field, else show all country discoms
      let stateDiscoms = countryDiscoms;
      if (stateName && stateName !== 'All') {
        const stateFiltered = countryDiscoms.filter(
          d => d.state && d.state.toLowerCase() === stateName.toLowerCase()
        );
        // If discoms have state field, use filtered. Otherwise show all country discoms.
        if (stateFiltered.length > 0) stateDiscoms = stateFiltered;
      }

      console.log(`Fetched ${stateDiscoms.length} discoms for ${countryName} / ${stateName}`);
      setDiscoms(stateDiscoms);

      // Filter templates to only show ones for the state's discoms
      const discomIds = stateDiscoms.map(d => d._id.toString());
      setTemplates(allTemplates.filter(t =>
        t.discom_id && discomIds.includes(t.discom_id._id?.toString() || t.discom_id.toString())
      ));

    } catch (err) {
      console.error('Error fetching country/state data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, OCR_aliases_json: JSON.parse(formData.OCR_aliases_json) };
      const method = editingTemplate ? 'PUT' : 'POST';
      const url = editingTemplate
        ? `${API_URL}/api/v2/bill-templates/${editingTemplate._id}`
        : `${API_URL}/api/v2/bill-templates`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchCountryStateData(selectedCountry, selectedState);
      } else {
        alert('Error saving template');
      }
    } catch (err) {
      alert('Invalid JSON in aliases');
    }
  };

  const openEdit = (t) => {
    setEditingTemplate(t);
    setFormData({
      discom_id: t.discom_id?._id || t.discom_id,
      consumer_type: t.consumer_type,
      version: t.version,
      active: t.active,
      OCR_aliases_json: JSON.stringify(t.OCR_aliases_json, null, 2)
    });
    setIsModalOpen(true);
  };

  // ── STEP 1: Country Selection ─────────────────────────────────────────────
  if (!selectedCountry) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-[#0B1231]">Select Country</h1>
          <p className="text-gray-500 mt-1">Choose a country to manage its DISCOM Bill Templates</p>
        </div>

        {loading ? <p className="p-6">Loading countries...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {countries.map(country => (
              <div
                key={country._id || country.name}
                onClick={() => handleSelectCountry(country.name)}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0B1231]">{country.name}</h3>
                    <p className="text-sm text-gray-500">Manage Templates</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Fallbacks if DB is empty */}
            {countries.length === 0 && (
              <>
                {['India', 'Australia', 'New Zealand', 'United Kingdom', 'United States'].map(name => (
                  <div key={name} onClick={() => handleSelectCountry(name)} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Globe className="w-6 h-6" /></div>
                      <div><h3 className="text-lg font-bold text-[#0B1231]">{name}</h3><p className="text-sm text-gray-500">Manage Templates</p></div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── STEP 2: State Selection ───────────────────────────────────────────────
  if (!selectedState) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setSelectedCountry(null); setStates([]); }}
              className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0B1231]">{selectedCountry} — Select State</h1>
              <p className="text-gray-500 mt-1">Choose a state to view/manage its Bill Templates</p>
            </div>
          </div>
        </div>

        {statesLoading ? (
          <p className="p-6 text-gray-500">Loading states...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* "All States" option */}
            <div
              onClick={() => handleSelectState('All')}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-yellow-300 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:bg-yellow-400 group-hover:text-white transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0B1231]">All States</h3>
                  <p className="text-xs text-gray-400">Show all discoms</p>
                </div>
              </div>
            </div>

            {states.length === 0 ? (
              <div className="col-span-3 text-center text-gray-400 py-8">
                No states found for {selectedCountry}. Click "All States" to see templates.
              </div>
            ) : (
              states.map(state => (
                <div
                  key={state}
                  onClick={() => handleSelectState(state)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0B1231]">{state}</h3>
                      <p className="text-xs text-gray-400">Manage Templates</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // ── STEP 3: Templates List for Country + State ────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedState(null)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
              <span>{selectedCountry}</span>
              <span>›</span>
              <span>{selectedState}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B1231]">Bill Templates (OCR)</h1>
            <p className="text-gray-500 mt-0.5 text-sm">Manage OCR aliases for DISCOMs in {selectedCountry} / {selectedState}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null);
            setFormData({ discom_id: '', consumer_type: 'Residential', version: '', active: true, OCR_aliases_json: '{\n  "consumer_number": ["Account No"],\n  "units_consumed": ["Units"],\n  "total_bill": ["Net Payable"]\n}' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-4 py-2.5 rounded-xl font-bold transition-all"
        >
          <Plus className="w-5 h-5" /> Add Template
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="px-6 py-4">DISCOM</th>
              <th className="px-6 py-4">Version</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading templates...</td></tr>
            ) : templates.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                No templates found for {selectedCountry} / {selectedState}. Click "+ Add Template" to create one.
              </td></tr>
            ) : templates.map(t => (
              <tr key={t._id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" />{t.discom_id?.name || 'Unknown'}</div>
                </td>
                <td className="px-6 py-4">{t.version}</td>
                <td className="px-6 py-4">{t.consumer_type}</td>
                <td className="px-6 py-4">
                  {t.active
                    ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Active</span>
                    : <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">Inactive</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(t)} className="text-blue-600 hover:text-blue-800 p-2"><Edit2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── ADD / EDIT TEMPLATE MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingTemplate ? 'Edit' : 'Add'} Template</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">DISCOM</label>
                <select
                  required
                  className="w-full border p-2.5 rounded-xl"
                  value={formData.discom_id}
                  onChange={e => setFormData({ ...formData, discom_id: e.target.value })}
                >
                  <option value="">Select DISCOM ({selectedCountry} / {selectedState})</option>
                  {discoms.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Version (e.g. 2026_v1)</label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2.5 rounded-xl"
                    value={formData.version}
                    onChange={e => setFormData({ ...formData, version: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Consumer Type</label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2.5 rounded-xl"
                    value={formData.consumer_type}
                    onChange={e => setFormData({ ...formData, consumer_type: e.target.value })}
                  />
                </div>
              </div>

              {/* OCR Aliases with Bill Upload → Auto-Extract */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">OCR Aliases (JSON)</label>
                  <label className="cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
                    {isScanning ? (
                      <>
                        <span className="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full inline-block" /> Scanning...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" /> Auto-Extract from Bill
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={handleScanSampleBill}
                      disabled={isScanning}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mb-1">Upload a sample bill PDF/image to auto-fill field names, then edit if needed.</p>
                <textarea
                  required
                  rows={8}
                  className="w-full border p-2.5 rounded-xl font-mono text-sm"
                  value={formData.OCR_aliases_json}
                  onChange={e => setFormData({ ...formData, OCR_aliases_json: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                />
                <label htmlFor="active">Active</label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-900 text-white rounded-xl font-semibold">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

