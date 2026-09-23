import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Check, X, Globe, ArrowLeft, Building2, MapPin } from 'lucide-react';
import axios from 'axios';
import { fetchWithCache } from '../utils/fetchWithCache';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4005';
const DEFAULT_RULE = { field: '', regex: '', type: 'string', required: false };

export default function BillTemplateManagementScreen() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [states, setStates] = useState([]);
  const [discoms, setDiscoms] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statesLoading, setStatesLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [formData, setFormData] = useState({
    discomName: '',
    country: 'india',
    isActive: true,
      status: 'approved',
    anchorKeywords: '',
    extractionRules: []
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const res = await fetchWithCache(`${API_URL}/api/countries`);
      const data = await res.json();
      const countryList = data.success ? data.data : (Array.isArray(data) ? data : []);
      setCountries(countryList.filter(c => c.isActive !== false));
    } catch (err) {
      console.error('Error fetching countries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCountry = async (countryName) => {
    setSelectedCountry(countryName);
    setSelectedState(null);
    setStates([]);
    setStatesLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/discoms?country=${countryName}`);
      const data = await res.json();
      let stateList = [];
      if (data.success && data.data) {
        stateList = [...new Set(data.data.filter(d => d.isActive).map(d => d.state).filter(Boolean))].sort();
      } else if (Array.isArray(data)) {
        stateList = [...new Set(data.filter(d => d.isActive).map(d => d.state).filter(Boolean))].sort();
      }
      setStates(stateList);
    } catch (err) {
      console.error('Error fetching states:', err);
      setStates([]);
    } finally {
      setStatesLoading(false);
    }
  };

  const handleSelectState = async (stateName) => {
    setSelectedState(stateName);
    fetchCountryStateData(selectedCountry, stateName);
  };

  const fetchCountryStateData = async (countryName, stateName) => {
    setLoading(true);
    try {
      const [tempRes, discRes] = await Promise.all([
        axios.get(`${API_URL}/api/v2/bill-templates`),
        fetch(`${API_URL}/api/discoms?country=${countryName}`)
      ]);
      const tempJson = tempRes.data;
      const discJson = await discRes.json();

      const allTemplates = tempJson.data || [];
      let countryDiscoms = [];
      if (discJson && Array.isArray(discJson.data)) {
        countryDiscoms = discJson.data;
      } else if (Array.isArray(discJson)) {
        countryDiscoms = discJson;
      }

      let stateDiscoms = countryDiscoms;
      if (stateName && stateName !== 'All') {
        stateDiscoms = countryDiscoms.filter(
          d => d.state && d.state.toLowerCase().trim() === stateName.toLowerCase().trim()
        );
      }
      setDiscoms(stateDiscoms);

      // We only show templates for discoms listed in this state
      const discomNamesInState = stateDiscoms.map(d => d.name.toLowerCase().trim());
      
      setTemplates(allTemplates.filter(t => 
        t.discomName && discomNamesInState.includes(t.discomName.toLowerCase().trim())
      ));

    } catch (err) {
      console.error('Error fetching country/state data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (template = null, prefilledDiscom = '') => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        discomName: template.discomName,
        country: template.country,
        isActive: true,
          status: 'approved',
        anchorKeywords: template.anchorKeywords.join(', '),
        extractionRules: template.extractionRules || []
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        discomName: prefilledDiscom,
        country: selectedCountry?.toLowerCase() || 'india',
        isActive: true,
      status: 'approved',
        anchorKeywords: prefilledDiscom, // default anchor to name
        extractionRules: [{ ...DEFAULT_RULE }]
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validation: Check if any rule has an empty field name
    const unmappedRules = formData.extractionRules.filter(r => !r.field);
    if (unmappedRules.length > 0) {
        alert("Validation Error: Please assign a 'Field Name' from the dropdown to every regex rule before saving.");
        return;
    }
    
    try {
      const payload = {
        ...formData,
        anchorKeywords: formData.anchorKeywords.split(',').map(k => k.trim()).filter(k => k)
      };

      if (editingTemplate) {
        await axios.put(`${API_URL}/api/v2/bill-templates/${editingTemplate._id}`, payload);
      } else {
        await axios.post(`${API_URL}/api/v2/bill-templates`, payload);
      }
      setIsModalOpen(false);
      fetchCountryStateData(selectedCountry, selectedState);
    } catch (err) {
      console.error('Failed to save template', err);
      alert('Failed to save template. Check console.');
    }
  };

  
  const [isScanning, setIsScanning] = useState(false);

  const handleScanSampleBill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    const fd = new FormData();
    fd.append('billFile', file);
    e.target.value = ''; 

    try {
      const res = await axios.post(`${API_URL}/api/v2/bill-templates/auto-generate`, fd);
      if (res.data.success) {
        let generatedRules = res.data.data;
        if (typeof generatedRules === 'string') {
           generatedRules = JSON.parse(generatedRules);
        }
        if (Array.isArray(generatedRules)) {
           setFormData(prev => ({ ...prev, extractionRules: generatedRules }));
           alert("Template Rules automatically generated from sample bill!");
        }
      }
    } catch (err) {
      console.error("Error scanning bill", err);
      alert("Failed to auto-generate from bill");
    } finally {
      setIsScanning(false);
    }
  };

  const updateRule = (index, key, value) => {
    const rules = [...formData.extractionRules];
    rules[index][key] = value;
    setFormData({ ...formData, extractionRules: rules });
  };
  const addRule = () => setFormData({ ...formData, extractionRules: [...formData.extractionRules, { ...DEFAULT_RULE }] });
  const removeRule = (index) => {
    const rules = [...formData.extractionRules];
    rules.splice(index, 1);
    setFormData({ ...formData, extractionRules: rules });
  };


  // UI RENDERERS
  if (!selectedCountry) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800">Bill Template Rules (Zero-Cost Engine)</h1>
          <p className="text-slate-500 mt-1">Select a country to manage Regex extraction overrides</p>
        </div>

        {loading ? <p className="p-6">Loading countries...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {countries.map(country => (
              <div key={country._id || country.name} onClick={() => handleSelectCountry(country.name)} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{country.name}</h3>
                    <p className="text-sm text-slate-500">Manage Templates</p>
                  </div>
                </div>
              </div>
            ))}
            {countries.length === 0 && ['India', 'Australia', 'New Zealand'].map(name => (
               <div key={name} onClick={() => handleSelectCountry(name)} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white"><Globe className="w-6 h-6" /></div>
                    <div><h3 className="text-lg font-bold text-slate-800">{name}</h3><p className="text-sm text-slate-500">Manage Templates</p></div>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!selectedState) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedCountry(null); setStates([]); }} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{selectedCountry} — Select State</h1>
              <p className="text-slate-500 mt-1">Choose a state to view/manage its Bill Templates</p>
            </div>
          </div>
        </div>

        {statesLoading ? <p className="p-6 text-slate-500">Loading states...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div onClick={() => handleSelectState('All')} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-yellow-300 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:bg-yellow-400 group-hover:text-white transition-colors"><MapPin className="w-5 h-5" /></div>
                <div><h3 className="font-bold text-slate-800">All States</h3><p className="text-xs text-slate-400">Show all discoms</p></div>
              </div>
            </div>
            {states.map(state => (
              <div key={state} onClick={() => handleSelectState(state)} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><MapPin className="w-5 h-5" /></div>
                  <div><h3 className="font-bold text-slate-800">{state}</h3><p className="text-xs text-slate-400">Manage Templates</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // DISCOM / TEMPLATES LIST
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedState(null); setDiscoms([]); setTemplates([]); }} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{selectedCountry} &gt; {selectedState} &gt; Discoms</h1>
              <p className="text-slate-500 text-sm mt-1">Manage zero-cost Regex templates for these Discoms</p>
            </div>
          </div>
          
        </div>
      </div>

      {loading ? <p className="p-6">Loading discoms and templates...</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-4 font-medium">Discom Name</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Regex Rules</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discoms.map(d => {
                const existingTemplate = templates.find(t => t.discomName.toLowerCase().trim() === d.name.toLowerCase().trim());
                return (
                  <tr key={d._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {d.name}
                      </div>
                    </td>
                    <td className="p-4">
                      {existingTemplate ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">Active Override</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase">Using Base Parser</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {existingTemplate ? `${existingTemplate.extractionRules?.length || 0} fields covered` : '---'}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      {existingTemplate ? (
                        <button onClick={() => handleOpenModal(existingTemplate)} className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-bold">Edit Rules</button>
                      ) : (
                        <button onClick={() => handleOpenModal(null, d.name)} className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-bold text-slate-600">Add Override</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {discoms.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400 italic">No discoms found for this state.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* REGEX BUILDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">{editingTemplate ? 'Edit Template Override' : 'New Template Override'}</h2>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 flex items-center gap-2">
                  {isScanning ? "Scanning PDF..." : "Upload Sample Bill (Auto-Generate Regex)"}
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleScanSampleBill} disabled={isScanning} />
                </label>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discom Name</label>
                  <input type="text" value={formData.discomName} onChange={e => setFormData({...formData, discomName: e.target.value})} className="w-full p-2 border rounded-lg text-sm bg-slate-50" readOnly={!!formData.discomName} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                  <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-2 border border-slate-300 bg-slate-100 rounded-lg text-sm" disabled>
                    <option value="india">India</option>
                    <option value="australia">Australia</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Anchor Keywords (comma separated)</label>
                  <input type="text" value={formData.anchorKeywords} onChange={e => setFormData({...formData, anchorKeywords: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. BSES Yamuna, bypl.customercare" />
                  <p className="text-[10px] text-slate-500 mt-1">These words MUST exist in the bill for the rules below to apply.</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-800">Regex Extraction Rules</h3>
                  <button type="button" onClick={addRule} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 hover:bg-indigo-100">
                    <Plus className="w-3 h-3" /> Add Rule
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.extractionRules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl relative">
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Field Name</label>
                          <select value={rule.field} onChange={e => updateRule(idx, 'field', e.target.value)} className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white">
                            <option value="">Select Field...</option>
                            <option value="monthlyBill">monthlyBill (Amount)</option>
                            <option value="quarterlyKwh">quarterlyKwh / monthlyUnits</option>
                            <option value="consumerNumber">consumerNumber</option>
                            <option value="consumerBillNumber">consumerBillNumber / invoiceNumber</option>
                            <option value="fullName">fullName / consumerName</option>
                            <option value="tariffCategory">tariffCategory</option>
                            <option value="meterCategory">meterCategory</option>
                            <option value="dueDate">dueDate</option>
                            <option value="billIssuedDate">billIssuedDate</option>
                            <option value="state">state</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Regex Pattern</label>
                          <input type="text" value={rule.regex} onChange={e => updateRule(idx, 'regex', e.target.value)} className="w-full p-1.5 text-xs font-mono border border-slate-300 rounded bg-white" placeholder="e.g. Total Amount\s*([0-9.]+)" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Type</label>
                          <select value={rule.type} onChange={e => updateRule(idx, 'type', e.target.value)} className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white">
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                          </select>
                        </div>
                      </div>
                      <button onClick={() => removeRule(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded mt-5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 flex items-center gap-2">
                <Check className="w-4 h-4" /> Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
