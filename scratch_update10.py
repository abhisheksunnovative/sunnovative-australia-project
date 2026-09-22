with open('Website_Admin/src/components/LeadScreen.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

filter_code = '''          extraFilters={[
            {
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

content = content.replace('          extraFilters={[', filter_code)

with open('Website_Admin/src/components/LeadScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Filter Restored!")
