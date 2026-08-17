import re

file_path = "D:/sunnovative-australia-website/Website_Admin/src/components/TrustBadgeEpcScreen.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the thead to reduce columns
old_thead = """                <thead className="bg-orange-600 text-white">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                      Partner & Company
                    </th>
                    <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                      Contact & Mobile
                    </th>
                    <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                      State / HQ Location
                    </th>
                    <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                      Capacity Allowed
                    </th>
                    <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider text-center">
                      Installers
                    </th>
                    <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider text-center">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider text-center">
                      KYC / Agreement
                    </th>
                    <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider text-center">
                      Actions
                    </th>
                  </tr>
                </thead>"""

new_thead = """                <thead className="bg-orange-600 text-white">
                  <tr>
                    <th className="px-4 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                      EPC Details
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                      Capacity Allowed
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold font-display uppercase tracking-wider text-center">
                      Installers
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold font-display uppercase tracking-wider text-center">
                      Status & Badges
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold font-display uppercase tracking-wider text-center">
                      KYC
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold font-display uppercase tracking-wider text-center">
                      Actions
                    </th>
                  </tr>
                </thead>"""

content = content.replace(old_thead, new_thead)

# 2. Update the skeleton loader columns length
old_skeleton = """                      {Array.from({ length: 9 }).map((__, j) => ("""
new_skeleton = """                      {Array.from({ length: 7 }).map((__, j) => ("""
content = content.replace(old_skeleton, new_skeleton)

old_colspan = """<td colSpan={9} className="py-12">"""
new_colspan = """<td colSpan={7} className="py-12">"""
content = content.replace(old_colspan, new_colspan)

# 3. Update the rows
old_rows = """                      {/* Name & Company */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary group-hover:text-accent transition-colors font-display">
                            {p.partnerName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {p.companyName}
                          </span>
                        </div>
                      </td>

                      {/* Contact details */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs">
                        <div className="flex flex-col text-gray-600">
                          <span>{p.email}</span>
                          <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {p.mobile}
                          </span>
                        </div>
                      </td>

                      {/* HQ location */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <div className="flex flex-col text-gray-600">
                            <span>
                              {p.hqLocation}, {p.state}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {p.cluster}
                            </span>
                          </div>
                        </div>
                      </td>"""

new_rows = """                      {/* Combined EPC Info */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <div>
                            <span className="text-sm font-bold text-primary group-hover:text-accent transition-colors font-display block">
                              {p.partnerName}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium block">
                              {p.companyName}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500 font-medium mt-1">
                            <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                              {p.email}
                            </span>
                            <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-mono">
                              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              {p.mobile}
                            </span>
                            <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {p.hqLocation}, {p.state}
                            </span>
                          </div>
                        </div>
                      </td>"""

content = content.replace(old_rows, new_rows)

# 4. Enhance the trust badge button
old_button = """                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedPartner(p); setProfileActiveTab("trustBadge");  }}
                          className="mt-2 text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono bg-blue-50 text-blue-700 block mx-auto cursor-pointer"
                        >
                          TrustBadge: {p.trustBadge?.status || 'None'}
                        </button>"""

new_button = """                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedPartner(p); 
                            setProfileActiveTab("trustBadge"); 
                          }}
                          className={p.trustBadge?.status === 'Pending' 
                            ? "mt-2.5 w-[130px] mx-auto text-[10px] px-2.5 py-1.5 rounded-md uppercase tracking-wider font-bold bg-amber-500 text-white shadow-md hover:bg-amber-600 hover:shadow-lg transition-all animate-pulse flex items-center justify-center gap-1.5 cursor-pointer border border-amber-600"
                            : "mt-2.5 w-[130px] mx-auto text-[9px] px-2 py-1 rounded-sm uppercase tracking-wider font-mono bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors block cursor-pointer"}
                        >
                          {p.trustBadge?.status === 'Pending' && <ShieldCheck className="w-3 h-3 shrink-0" />}
                          {p.trustBadge?.status === 'Pending' ? "Approve Badge" : `Badge: ${p.trustBadge?.status || 'None'}`}
                        </button>"""

content = content.replace(old_button, new_button)

# 5. Fix padding to save space
content = content.replace('px-5 py-4', 'px-4 py-4')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
