import React, { useState, useEffect } from 'react';

import { AlertTriangle, Clock, Activity, MapPin, Filter, Search, ArrowRight, CheckCircle2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

export default function BDEOverdueDashboard({ bdeId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    projectType: '',
    stage: ''
  });

  const fetchOverdueProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/bde/${bdeId}/overdue-projects`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Error fetching overdue projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bdeId) fetchOverdueProjects();
  }, [bdeId]);

  // Derived state
  const filteredProjects = projects.filter(p => {
    if (filters.state && p.state !== filters.state) return false;
    if (filters.district && p.location?.district !== filters.district) return false;
    if (filters.projectType && p.projectType !== filters.projectType) return false;
    if (filters.stage && p.currentStepTitle !== filters.stage) return false;
    return true;
  });

  const todayOverdueCount = filteredProjects.filter(p => p.steps.some(s => s.isOverdue && s.daysOverdue <= 1)).length;
  const criticalCount = filteredProjects.filter(p => p.steps.some(s => s.isCritical)).length;
  const pendingCustomerCount = filteredProjects.filter(p => p.pendingActionFor === 'customer').length;

  const stageSummary = filteredProjects.reduce((acc, curr) => {
    acc[curr.currentStepTitle] = (acc[curr.currentStepTitle] || 0) + 1;
    return acc;
  }, {});

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-24">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="text-red-500 w-6 h-6" /> Overdue Customers Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Monitor and resolve delayed project stages</p>
        </div>
        <button onClick={fetchOverdueProjects} className="px-4 py-2 bg-white border rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Refresh Data
        </button>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Clock className="w-5 h-5"/></div>
            <p className="text-sm font-semibold text-slate-500">Today's Overdue</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{todayOverdueCount}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-sm bg-red-50/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-600 text-white rounded-lg"><AlertTriangle className="w-5 h-5"/></div>
            <p className="text-sm font-semibold text-red-700">Critical Cases</p>
          </div>
          <p className="text-2xl font-bold text-red-700">{criticalCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Activity className="w-5 h-5"/></div>
            <p className="text-sm font-semibold text-slate-500">Pending Customer Action</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{pendingCustomerCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
           <h3 className="text-sm font-semibold text-slate-500 mb-2">Stage-wise Summary</h3>
           <div className="space-y-2 max-h-20 overflow-y-auto pr-1">
             {Object.entries(stageSummary).map(([stage, count]) => (
               <div key={stage} className="flex justify-between items-center text-xs">
                 <span className="truncate text-slate-700 pr-2">{stage}</span>
                 <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{count}</span>
               </div>
             ))}
             {Object.keys(stageSummary).length === 0 && <span className="text-xs text-slate-400">No overdue stages</span>}
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
          <Filter className="w-4 h-4"/> Filters:
        </div>
        <select name="state" value={filters.state} onChange={handleFilterChange} className="text-sm border rounded-lg px-3 py-2 bg-slate-50">
          <option value="">All States</option>
          <option value="Gujarat">Gujarat</option>
          <option value="Maharashtra">Maharashtra</option>
        </select>
        <input 
          type="text" name="district" placeholder="District..." 
          value={filters.district} onChange={handleFilterChange} 
          className="text-sm border rounded-lg px-3 py-2 bg-slate-50 w-32"
        />
        <select name="projectType" value={filters.projectType} onChange={handleFilterChange} className="text-sm border rounded-lg px-3 py-2 bg-slate-50">
          <option value="">All Types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </select>
        <input 
          type="text" name="stage" placeholder="Stage Name..." 
          value={filters.stage} onChange={handleFilterChange} 
          className="text-sm border rounded-lg px-3 py-2 bg-slate-50 w-40"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-10 text-center">
             <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
               <CheckCircle2 className="w-8 h-8" />
             </div>
             <p className="text-lg font-semibold text-slate-700">No overdue projects!</p>
             <p className="text-slate-500">Everything is on track.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Stage</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => {
                  const overdueStep = project.steps.find(s => s.isOverdue);
                  return (
                    <tr key={project._id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{project.customerName}</p>
                        <p className="text-xs text-slate-500">{project.customerMobile}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                          {project.projectType}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400"/> {project.location?.district || '-'}
                        </p>
                        <p className="text-xs text-slate-500">{project.state}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-slate-800">{project.currentStepTitle}</p>
                        <p className="text-xs text-slate-500 mt-1">Pending with: <span className="font-semibold">{project.pendingActionFor}</span></p>
                      </td>
                      <td className="p-4">
                        {overdueStep ? (
                          <div>
                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${overdueStep.isCritical ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                              {overdueStep.daysOverdue} Days Overdue
                            </span>
                            {overdueStep.isCritical && (
                              <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Critical
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Error reading overdue step</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          View Details <ArrowRight className="w-4 h-4"/>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
