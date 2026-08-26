import re

with open("src/components/bde/BDELeadManagement.jsx", "r", encoding="utf8") as f:
    content = f.read()

old_grid = """      {Object.keys(projectTypeCounts).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(projectTypeCounts).map(([pt, count]) => (
            <div 
              key={pt} 
              onClick={() => setFilterProject(filterProject === pt ? "" : pt)}
              className={`bg-white border rounded-xl p-4 flex flex-col justify-center cursor-pointer transition-all hover:shadow-md ${filterProject === pt ? 'ring-2 ring-blue-500 shadow-md border-transparent' : 'border-slate-200'}`}
            >
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{pt}</div>
              <div className="text-3xl font-bold text-slate-800">{count}</div>
            </div>
          ))}
        </div>
      )}"""
      
new_grid = """      {Object.keys(projectTypeCounts).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(projectTypeCounts).map(([pt, count]) => (
            <div 
              key={pt} 
              onClick={() => setFilterProject(filterProject === pt ? "" : pt)}
              className={`bg-white border rounded-xl p-4 flex flex-col justify-center cursor-pointer transition-all hover:shadow-md ${filterProject === pt ? 'ring-2 ring-blue-500 shadow-md border-transparent' : 'border-slate-200'}`}
            >
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Project Type</div>
              <div className="text-lg font-bold text-slate-800 uppercase truncate">{pt}</div>
              <div className="text-3xl font-black text-blue-600 mt-2">{count}</div>
            </div>
          ))}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 flex flex-col justify-center">
              <div className="text-[10px] font-black text-emerald-600/70 uppercase tracking-wider mb-1">Total Leads</div>
              <div className="text-lg font-bold text-emerald-900 uppercase">In Bucket</div>
              <div className="text-3xl font-black text-emerald-600 mt-2">{Object.values(projectTypeCounts).reduce((a,b)=>a+b,0)}</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4 flex flex-col justify-center">
              <div className="text-[10px] font-black text-indigo-600/70 uppercase tracking-wider mb-1">Status</div>
              <div className="text-lg font-bold text-indigo-900 uppercase">Active</div>
              <div className="text-3xl font-black text-indigo-600 mt-2">{Object.values(projectTypeCounts).reduce((a,b)=>a+b,0)}</div>
          </div>
        </div>
      )}"""

content = content.replace(old_grid, new_grid)

with open("src/components/bde/BDELeadManagement.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("Done")
