import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

const ProjectTypeSettings = ({ selectedCountry, readOnly = false }) => {
  const [projectTypes, setProjectTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    projectType: '',
    projectTypeLabel: '',
    availableKw: [],
    isActive: true
  });
  const [kwInput, setKwInput] = useState('');

  useEffect(() => {
    fetchProjectTypes();
  }, [selectedCountry]);

  const fetchProjectTypes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/project-types?country=${selectedCountry}`);
      const result = await res.json();
      if (result.success) {
        setProjectTypes(result.data);
      }
    } catch (err) {
      console.error('Error fetching project types:', err);
    }
  };

  const handleOpen = (type = null) => {
    if (type) {
      setEditingId(type._id);
      setFormData({
        projectType: type.projectType,
        projectTypeLabel: type.projectTypeLabel,
        availableKw: type.availableKw || [],
        isActive: type.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        projectType: '',
        projectTypeLabel: '',
        availableKw: [],
        isActive: true
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setKwInput('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'projectTypeLabel' && !editingId) {
      const autoKey = value.toLowerCase().replace(/\s+/g, '-');
      setFormData((prev) => ({ ...prev, [name]: value, projectType: autoKey }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddKw = () => {
    if (kwInput.trim() && !formData.availableKw.includes(kwInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        availableKw: [...prev.availableKw, kwInput.trim()]
      }));
    }
    setKwInput('');
  };

  const handleDeleteKw = (kwToRemove) => {
    setFormData((prev) => ({
      ...prev,
      availableKw: prev.availableKw.filter((kw) => kw !== kwToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `${API_BASE}/api/project-types/${editingId}`
        : `${API_BASE}/api/project-types`;
      
      const method = editingId ? 'PUT' : 'POST';
      const payload = { ...formData, country: selectedCountry };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        fetchProjectTypes();
        handleClose();
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Error saving project type:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project type?")) {
      try {
        const url = `${API_BASE}/api/project-types/${id}`;
        const res = await fetch(url, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
          fetchProjectTypes();
        }
      } catch (err) {
        console.error('Error deleting project type:', err);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Project Types ({selectedCountry.toUpperCase()})
        </h2>
        <button
          onClick={() => handleOpen()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Project Type
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-6 py-3 text-sm font-bold text-slate-700">Label</th>
              <th className="px-6 py-3 text-sm font-bold text-slate-700">Key</th>
              <th className="px-6 py-3 text-sm font-bold text-slate-700">Available kW</th>
              <th className="px-6 py-3 text-sm font-bold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projectTypes.map((row) => (
              <tr key={row._id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{row.projectTypeLabel}</td>
                <td className="px-6 py-4 text-slate-500">{row.projectType}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {row.availableKw?.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">
                        {kw} kW
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpen(row)} className="text-blue-500 hover:text-blue-700 p-2">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(row._id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {projectTypes.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                  No project types found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Project Type' : 'Add Project Type'}</h3>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Type Label (e.g. Residential Solar)</label>
                <input
                  type="text"
                  name="projectTypeLabel"
                  value={formData.projectTypeLabel}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Type Key</label>
                <input
                  type="text"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Canonical key (auto-generated from label if left empty)</p>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Available kW Sizes</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={kwInput}
                    onChange={(e) => setKwInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKw(); } }}
                    placeholder="e.g. 6.6"
                    className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button type="button" onClick={handleAddKw} className="px-4 py-2 bg-slate-100 font-semibold rounded-lg hover:bg-slate-200">
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.availableKw.map((kw, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                      {kw} kW
                      <button type="button" onClick={() => handleDeleteKw(kw)} className="text-orange-600 hover:text-orange-900 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
                <button type="button" onClick={handleClose} className="px-5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTypeSettings;
