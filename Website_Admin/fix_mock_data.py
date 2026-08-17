import re

file_path = "D:/sunnovative-australia-website/Website_Admin/src/components/TrustBadgeEpcScreen.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace Tab 3: Agreement
old_tab_3 = """              {/* --- TAB 3: AGREEMENT TERMS --- */}
              {profileActiveTab === "agreement" && (
                <div className="space-y-3 p-1 text-xs">
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#22A06B]" />
                      <div>
                        <p className="font-bold">E-Sign Execution Complete</p>
                        <p className="text-[10px] text-emerald-600 mt-0.5">
                          Agreement status in valid state
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] bg-white rounded px-2 py-0.5 font-bold">
                      ACTIVE
                    </span>
                  </div>"""

new_tab_3 = """              {/* --- TAB 3: AGREEMENT TERMS --- */}
              {profileActiveTab === "agreement" && (
                <div className="space-y-3 p-1 text-xs">
                  {selectedPartner?.kycDocuments?.agreementSigned ? (
                    <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-[#22A06B]" />
                        <div>
                          <p className="font-bold">E-Sign Execution Complete</p>
                          <p className="text-[10px] text-emerald-600 mt-0.5">
                            Agreement status in valid state
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] bg-white rounded px-2 py-0.5 font-bold">
                        ACTIVE
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3.5 bg-red-50 rounded-xl border border-red-100 text-red-800">
                      <div className="flex items-center gap-2">
                        <X className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-bold">Agreement Not Signed</p>
                          <p className="text-[10px] text-red-600 mt-0.5">
                            Pending partner execution
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] bg-white rounded px-2 py-0.5 font-bold">
                        PENDING
                      </span>
                    </div>
                  )}"""

if old_tab_3 in content:
    content = content.replace(old_tab_3, new_tab_3)
    print("Replaced Tab 3")
else:
    print("Could not find Tab 3 snippet")

# Replace Tab 8: Ratings
old_tab_8 = """              {/* --- TAB 8: RATINGS & BENEFITS --- */}
              {profileActiveTab === "ratings" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex flex-col items-center justify-center border border-amber-200">
                      <Award className="w-8 h-8 text-secondary animate-bounce" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wide">
                        GRADE CERTIFIED BY CLIENTS
                      </p>
                      <h4 className="text-lg font-bold text-primary mt-0.5 font-display flex items-center gap-2">
                        {selectedPartner.rating} Star Rating
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                          PLATINUM QUALITY
                        </span>
                      </h4>
                    </div>
                  </div>"""

new_tab_8 = """              {/* --- TAB 8: RATINGS & BENEFITS --- */}
              {profileActiveTab === "ratings" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex flex-col items-center justify-center border border-amber-200">
                      <Award className="w-8 h-8 text-secondary animate-bounce" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wide">
                        GRADE CERTIFIED BY CLIENTS
                      </p>
                      <h4 className="text-lg font-bold text-primary mt-0.5 font-display flex items-center gap-2">
                        {selectedPartner.rating || 0} Star Rating ({selectedPartner.totalRatings || 0} reviews)
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                          {selectedPartner.rating >= 4.5 ? "PLATINUM QUALITY" : selectedPartner.rating >= 4.0 ? "GOLD QUALITY" : "STANDARD"}
                        </span>
                      </h4>
                    </div>
                  </div>"""

if old_tab_8 in content:
    content = content.replace(old_tab_8, new_tab_8)
    print("Replaced Tab 8")
else:
    print("Could not find Tab 8 snippet")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
