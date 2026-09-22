with open('Website_Admin/src/components/LeadScreen.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# 1. Remove the "Assign to BDE" button block
old_button = '''                          ) : lead.status === "New" ? (
                            <button 
                              onClick={() => setAssigningLead(lead)}
                              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Assign to BDE
                            </button>
                          ) : ('''

new_button = '''                          ) : lead.status === "New" ? (
                            <span className="px-2 py-1 bg-slate-100 text-slate-500 font-semibold text-[10px] rounded-lg border border-slate-200 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-cyan-600"/> New Lead
                            </span>
                          ) : ('''

content = content.replace(old_button, new_button)

# 2. Remove the Assigned BDE filter
filter_block = '''            {
              isActive: Boolean(assignedBde),
              component: (
                <select value={assignedBde} onChange={e => setAssignedBde(e.target.value)}
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium">
                  <option value="">Assigned BDE</option>
                  <option value="unassigned">Unassigned</option>
                  {bdes.map(bde => <option key={bde._id} value={bde._id}>{bde.name}</option>)}
                </select>
              )
            },'''

content = content.replace(filter_block, '')

with open('Website_Admin/src/components/LeadScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin panel!")
