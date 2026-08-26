const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldBlock = `{/* Move to Order Journey / Token Payment */}
                <div className="flex flex-col gap-2 mt-2">
                  {!isAU ? (
                    lead.tokenPaid ? (
                      <p className="text-[10px] font-bold text-emerald-600 text-center uppercase bg-emerald-50 py-2 rounded border border-emerald-100">Token Paid. Waiting for EPC to accept to auto-move to Order Journey.</p>
                    ) : (
                      <>
                        <p className="text-[10px] font-bold text-rose-600 text-center uppercase">Ask customer to pay token</p>
                        <button onClick={() => handleSimulatePayment(lead)} className="text-[10px] text-blue-600 font-bold underline text-center mt-1">Simulate Token Payment</button>
                      </>
                    )
                  ) : (
                    <>
                      <button onClick={async () => {
                        try {
                          const res = await fetch(\`\${API_BASE}/api/bde/leads/\${lead._id}/move-to-order\`, { method: "PUT", headers: { Authorization: \`Bearer \${token}\` } });
                          if (res.ok) { alert("Moved to Order Journey!"); fetchLeads(); }
                        } catch (e) {}
                      }} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm font-bold rounded-lg transition flex justify-center items-center gap-2">
                         Move to Order Journey
                      </button>
                    </>
                  )}
                </div>`;

const newBlock = `{/* Move to Order Journey / Token Payment */}
                <div className="flex flex-col gap-2 mt-2">
                  {/* Follow-up Date Editor */}
                  <div className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col gap-1 shadow-sm mb-1">
                    <div className="flex justify-between items-center">
                      <div className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3"/> Follow-up Date
                      </div>
                      <input 
                        type="date" 
                        className="bg-transparent border-none p-0 text-[10px] font-bold text-blue-700 cursor-pointer focus:ring-0"
                        value={lead.nextFollowUp ? lead.nextFollowUp.split("T")[0] : ""}
                        onChange={async (e) => {
                          try {
                            const res = await fetch(\`\${API_BASE}/api/bde/leads/\${lead._id}/status\`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json", Authorization: \`Bearer \${token}\` },
                              body: JSON.stringify({ status: lead.status, nextFollowUp: e.target.value })
                            });
                            if (res.ok) { fetchLeads(); }
                          } catch (err) {}
                        }}
                      />
                    </div>
                  </div>

                  {!isAU ? (
                    lead.tokenPaid ? (
                      <p className="text-[10px] font-bold text-emerald-600 text-center uppercase bg-emerald-50 py-2 rounded border border-emerald-100">Token Paid. Waiting for EPC to accept to auto-move to Order Journey.</p>
                    ) : (
                      <>
                        <p className="text-[10px] font-bold text-rose-600 text-center uppercase bg-rose-50 border border-rose-200 py-1.5 rounded shadow-sm">Ask customer to pay token amount</p>
                        <button onClick={() => handleSimulatePayment(lead)} className="text-[9px] text-blue-600 font-bold underline text-center">Simulate Token Payment</button>
                      </>
                    )
                  ) : (
                    <>
                      <button onClick={async () => {
                        try {
                          const res = await fetch(\`\${API_BASE}/api/bde/leads/\${lead._id}/move-to-order\`, { method: "PUT", headers: { Authorization: \`Bearer \${token}\` } });
                          if (res.ok) { alert("Moved to Order Journey!"); fetchLeads(); }
                        } catch (e) {}
                      }} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm font-bold rounded-lg transition flex justify-center items-center gap-2">
                         Move to Order Journey
                      </button>
                    </>
                  )}
                </div>`;

if (code.includes(oldBlock)) {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync(file, code);
  console.log("Patched BDEProspects successfully!");
} else {
  console.log("Could not find block in BDEProspects");
}
