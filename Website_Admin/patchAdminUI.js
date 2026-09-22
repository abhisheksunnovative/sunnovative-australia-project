import fs from 'fs';

const jsx = `import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Check, X, Search } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEFAULT_RULE = { field: '', regex: '', type: 'string', required: false };

export default function BillTemplateManagementScreen() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [formData, setFormData] = useState({
    discomName: '',
    country: 'india',
    isActive: true,
    anchorKeywords: '',
    extractionRules: []
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(\`\${API_URL}/api/v2/bill-templates\`);
      if (res.data.success) {
        setTemplates(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching templates', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        discomName: template.discomName,
        country: template.country,
        isActive: template.isActive,
        anchorKeywords: template.anchorKeywords.join(', '),
        extractionRules: template.extractionRules || []
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        discomName: '',
        country: 'india',
        isActive: true,
        anchorKeywords: '',
        extractionRules: [{ ...DEFAULT_RULE }]
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        anchorKeywords: formData.anchorKeywords.split(',').map(k => k.trim()).filter(k => k)
      };

      if (editingTemplate) {
        await axios.put(\`\${API_URL}/api/v2/bill-templates/\${editingTemplate._id}\`, payload);
      } else {
        await axios.post(\`\${API_URL}/api/v2/bill-templates\`, payload);
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (err) {
      console.error('Failed to save template', err);
      alert('Failed to save template. Check console.');
    }
  };

  const updateRule = (index, key, value) => {
    const rules = [...formData.extractionRules];
    rules[index][key] = value;
    setFormData({ ...formData, extractionRules: rules });
  };

  const addRule = () => {
    setFormData({ ...formData, extractionRules: [...formData.extractionRules, { ...DEFAULT_RULE }] });
  };

  const removeRule = (index) => {
    const rules = [...formData.extractionRules];
    rules.splice(index, 1);
    setFormData({ ...formData, extractionRules: rules });
  };

  if (loading) return <div className="p-8 text-center">Loading Templates...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bill Template Rules (Zero-Cost Engine)</h1>
          <p className="text-sm text-slate-500">Manage Discom Regex Overrides for Table-Aware OCR</p>
        </div>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Template
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="p-4 font-medium">Discom Name</th>
              <th className="p-4 font-medium">Country</th>
              <th className="p-4 font-medium">Anchor Keywords</th>
              <th className="p-4 font-medium">Rules Count</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(t => (
              <tr key={t._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-800">{t.discomName}</td>
                <td className="p-4 uppercase text-xs font-bold text-slate-500">{t.country}</td>
                <td className="p-4 text-slate-500 text-xs">{t.anchorKeywords.join(', ')}</td>
                <td className="p-4 text-slate-500">{t.extractionRules?.length || 0} rules</td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => handleOpenModal(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discom Name</label>
                  <input type="text" value={formData.discomName} onChange={e => setFormData({...formData, discomName: e.target.value})} className="w-full p-2 border rounded-lg text-sm" placeholder="e.g. BSES Yamuna" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                  <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-2 border rounded-lg text-sm">
                    <option value="india">India</option>
                    <option value="australia">Australia</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Anchor Keywords (comma separated)</label>
                  <input type="text" value={formData.anchorKeywords} onChange={e => setFormData({...formData, anchorKeywords: e.target.value})} className="w-full p-2 border rounded-lg text-sm" placeholder="e.g. BSES Yamuna, bypl.customercare" />
                  <p className="text-[10px] text-slate-500 mt-1">If these exact words are found in the bill, this template applies.</p>
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
                          <select value={rule.field} onChange={e => updateRule(idx, 'field', e.target.value)} className="w-full p-1.5 text-xs border rounded bg-white">
                            <option value="">Select Field...</option>
                            <option value="monthlyBill">monthlyBill (Amount)</option>
                            <option value="quarterlyKwh">quarterlyKwh / monthlyUnits</option>
                            <option value="consumerNumber">consumerNumber</option>
                            <option value="fullName">fullName</option>
                            <option value="tariffCategory">tariffCategory</option>
                            <option value="dueDate">dueDate</option>
                            <option value="meterTypeInfo">meterTypeInfo</option>
                            <option value="state">state</option>
                            <option value="postcode">postcode</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Regex Pattern</label>
                          <input type="text" value={rule.regex} onChange={e => updateRule(idx, 'regex', e.target.value)} className="w-full p-1.5 text-xs font-mono border rounded bg-white" placeholder="e.g. Total Amount\\s*([0-9.]+)" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Type</label>
                          <select value={rule.type} onChange={e => updateRule(idx, 'type', e.target.value)} className="w-full p-1.5 text-xs border rounded bg-white">
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
`;

fs.writeFileSync('src/components/BillTemplateManagementScreen.jsx', jsx);
console.log("Admin Bill Template Screen updated.");
