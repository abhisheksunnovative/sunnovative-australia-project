import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { MasterFilterBar } from "./common/MasterFilterBar";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export default function BlogManagementScreen() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Filters
  const [filterCountry, setFilterCountry] = useState('India');
  const [filterProjectType, setFilterProjectType] = useState('');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    country: 'india',
    projectType: '',
    summary: '',
    isActive: true
  });

  useEffect(() => {
    fetchBlogs();
  }, [filterCountry, filterProjectType, search]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/blogs?country=${filterCountry.toLowerCase()}`;
      if (filterProjectType) url += `&projectType=${filterProjectType}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        let filteredBlogs = data.data;
        if (search) {
          filteredBlogs = filteredBlogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));
        }
        setBlogs(filteredBlogs);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${API_BASE}/api/blogs/${editingId}`
        : `${API_BASE}/api/blogs`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        alert("success", `Blog ${editingId ? 'updated' : 'added'} successfully!`);
        setShowModal(false);
        fetchBlogs();
      } else {
        alert("error", data.message);
      }
    } catch (err) {
      alert("error", "Server error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert("success", "Blog deleted");
        fetchBlogs();
      }
    } catch (err) {
      alert("error", "Server error");
    }
  };

  const openModal = (blog = null) => {
    if (blog) {
      setEditingId(blog._id);
      setFormData({
        title: blog.title,
        slug: blog.slug,
        category: blog.category,
        country: blog.country,
        projectType: blog.projectType || '',
        summary: blog.summary || '',
        isActive: blog.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        slug: '',
        category: '',
        country: filterCountry.toLowerCase(),
        projectType: filterProjectType,
        summary: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Blog Management</h1>
          <p className="text-slate-500 text-sm">Manage Country-specific Blogs</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Blog
        </button>
      </div>

      <div className="mb-6">
        <MasterFilterBar
          search={search}
          setSearch={setSearch}
          countryFilter={filterCountry}
          setCountryFilter={setFilterCountry}
          onClear={() => { setFilterCountry('India'); setFilterProjectType(''); setSearch(''); }}
          extraFilters={[
            {
              isActive: Boolean(filterProjectType),
              component: (
                <input type="text" value={filterProjectType} onChange={e => setFilterProjectType(e.target.value)} placeholder="Project Type"
                  className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 font-medium" />
              )
            }
          ]}
        />
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b">
            <tr>
              <th className="p-4 font-semibold uppercase">Title</th>
              <th className="p-4 font-semibold uppercase">Category</th>
              <th className="p-4 font-semibold uppercase">Project Type</th>
              <th className="p-4 font-semibold uppercase">Status</th>
              <th className="p-4 font-semibold uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="5" className="text-center p-8 text-slate-500">Loading...</td></tr>
            ) : blogs.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-8 text-slate-500">No blogs found for this filter.</td></tr>
            ) : (
              blogs.map(blog => (
                <tr key={blog._id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{blog.title}</td>
                  <td className="p-4 text-slate-600">{blog.category}</td>
                  <td className="p-4 text-slate-600">{blog.projectType || '—'}</td>
                  <td className="p-4">
                    {blog.isActive ? (
                      <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold w-fit"><CheckCircle className="w-3 h-3"/> Active</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold w-fit"><XCircle className="w-3 h-3"/> Disabled</span>
                    )}
                  </td>
                  <td className="p-4 flex gap-2 justify-end">
                    <button onClick={() => openModal(blog)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(blog._id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Blog' : 'Add Blog'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="india">India</option>
                    <option value="australia">Australia</option>
                    <option value="newzealand">New Zealand</option>
                    <option value="uk">UK</option>
                    <option value="usa">USA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project Type</label>
                  <input type="text" value={formData.projectType} onChange={e => setFormData({...formData, projectType: e.target.value})} placeholder="Optional" className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Summary</label>
                <textarea rows="3" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} id="isActive" className="w-4 h-4" />
                <label htmlFor="isActive" className="text-sm font-medium">Blog is Active</label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save Blog</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
