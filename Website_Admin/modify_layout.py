import re

file_path = "D:/sunnovative-australia-website/Website_Admin/src/components/TrustBadgeEpcScreen.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Hide the grid div if cardProjectType is selected to remove empty whitespace
content = content.replace(
    '<div className="flex-1 overflow-auto p-6 min-h-[300px]">',
    '<div className={`flex-1 overflow-auto p-6 ${cardProjectType ? \'hidden\' : \'min-h-[300px]\'}`}>'
)

# 2. Add 'Show Details' button for pending trust badges
old_button = """                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedPartner(p); setProfileActiveTab("trustBadge"); setDrawerOpen(true); }}
                            className="mt-2 text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono bg-blue-50 text-blue-700 block mx-auto cursor-pointer"
                          >
                            TrustBadge: {p.trustBadge?.status || 'None'}
                          </button>"""

new_button = """                          {p.trustBadge?.status === 'Pending' ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedPartner(p); setProfileActiveTab("trustBadge"); }}
                              className="mt-2 text-[10px] px-4 py-1.5 rounded-lg uppercase tracking-wider font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all block mx-auto cursor-pointer animate-pulse"
                            >
                              Pending Show Details
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedPartner(p); setProfileActiveTab("trustBadge"); }}
                              className="mt-2 text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono bg-blue-50 text-blue-700 block mx-auto cursor-pointer"
                            >
                              TrustBadge: {p.trustBadge?.status || 'None'}
                            </button>
                          )}"""
content = content.replace(old_button, new_button)

# Also remove setDrawerOpen(true) from the standard Eye button
content = content.replace('setDrawerOpen(true);', '')

# 3. Change tab order so "Trust Badge" is second
old_tabs = """              <div className="flex border-b border-gray-100 overflow-x-auto gap-2">
                {[
                  { name: "Overview", id: "overview" },
                  { name: "KYC Details", id: "kyc" },
                  { name: "Agreement Terms", id: "agreement" },
                  { name: "Qualification Rules", id: "qualification" },
                  { name: "Subscription Plan", id: "subscription" },
                  { name: "Active Grid Projects", id: "projects" },
                  { name: "Assigned Crew", id: "installers" },
                  { name: "SaaS Ratings & Badges", id: "ratings" },
                  { name: "Trust Badge", id: "trustBadge" },
                ].map((tab) => {"""

new_tabs = """              <div className="flex border-b border-gray-100 overflow-x-auto gap-2">
                {[
                  { name: "Overview", id: "overview" },
                  { name: "Trust Badge", id: "trustBadge" },
                  { name: "KYC Details", id: "kyc" },
                  { name: "Agreement Terms", id: "agreement" },
                  { name: "Qualification Rules", id: "qualification" },
                  { name: "Subscription Plan", id: "subscription" },
                  { name: "Active Grid Projects", id: "projects" },
                  { name: "Assigned Crew", id: "installers" },
                  { name: "SaaS Ratings & Badges", id: "ratings" },
                ].map((tab) => {"""
content = content.replace(old_tabs, new_tabs)

# 4. Wrap the main views in {!selectedPartner && ( ... )} and replace DetailDrawer with full screen div
content = content.replace(
    '{/* HIERARCHY NAVIGATION UI */}',
    '{!selectedPartner && (<>\n        {/* HIERARCHY NAVIGATION UI */}'
)

# Replace DetailDrawer start with full screen div
old_drawer_start = """      {/* --- TAB-BASED EPCPARTNERS DETAIL SLIDABLE DRAWER --- */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedPartner?.partnerName || "EPC Partner Registry Profile"}
        subtitle={selectedPartner?.companyName}
      >"""

new_drawer_start = """      </>)}

      {/* --- FULL SCREEN PROFILE VIEW --- */}
      {selectedPartner && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[800px] flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <button onClick={() => setSelectedPartner(null)} className="text-sm font-bold text-slate-500 hover:text-primary flex items-center gap-2 mb-2 transition-colors">
                &larr; Back to EPC List
              </button>
              <h2 className="text-xl font-bold font-display text-primary">{selectedPartner?.partnerName || "EPC Partner Registry Profile"}</h2>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{selectedPartner?.companyName}</p>
            </div>
            <button onClick={() => setSelectedPartner(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="flex-1 p-6 overflow-auto">"""
content = content.replace(old_drawer_start, new_drawer_start)

# Replace DetailDrawer end accurately!
old_drawer_end = """          }
        </DetailDrawer>"""
# Wait, in backup file it is:
#           )}
#         </DetailDrawer>
# let's just do an exact replace
content = content.replace(
"""          )}
        </DetailDrawer>""",
"""            </div>
          )}
        </div>
      </div>
      )}"""
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Modification complete.")
