import re

with open("src/components/bde/BDELeadManagement.jsx", "r", encoding="utf8") as f:
    content = f.read()

handle_mark_eligible = """  const handleMarkEligible = async (lead) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/bde/leads/${lead._id}/eligibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isEligibleForInstallation: true })
      });
      if (res.ok) {
        fetchLeads();
      } else {
        alert("Failed to mark eligible.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenUploadBill = (lead) => {"""

if 'handleMarkEligible =' not in content:
    content = content.replace('  const handleOpenUploadBill = (lead) => {', handle_mark_eligible)


old_buttons = """                {isFreelancer ? (
                  !lead.billAmount ? (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      <button onClick={() => handleOpenUploadBill(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <Zap className="w-4 h-4" /> Upload Bill
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      { (lead.hasLoggedIn || lead.preferredInstallDate) ? (
                        <button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <Calendar className="w-4 h-4" /> Finalize Date
                        </button>
                      ) : (
                        <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-bold text-center w-full shadow-sm">
                          Ask customer to login and provide an installation date to unlock Finalize Date.
                        </div>
                      )}
                    </div>
                  )
                ) : ("""

new_buttons = """                {isFreelancer ? (
                  filterTab === "eligibility" ? (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      {!lead.billAmount ? (
                        <button onClick={() => handleOpenUploadBill(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <Zap className="w-4 h-4" /> Upload Bill
                        </button>
                      ) : (
                        <button onClick={() => handleMarkEligible(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <CheckCircle className="w-4 h-4" /> Mark Eligible
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      { (lead.hasLoggedIn || lead.preferredInstallDate) ? (
                        <button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <Calendar className="w-4 h-4" /> Finalize Date
                        </button>
                      ) : (
                        <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-bold text-center w-full shadow-sm">
                          Ask customer to login and provide an installation date to unlock Finalize Date.
                        </div>
                      )}
                    </div>
                  )
                ) : ("""

content = content.replace(old_buttons, new_buttons)


# ALSO restore the modal logic where India requires both bill and photo, and AU requires only bill!
# Wait, I don't remember the exact logic for that. Let me look at my patch from the previous session for that.
# Let's search the previous session's scripts.
