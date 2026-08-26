const fs = require('fs');

// --- 3. Fix BDEProspects.jsx ---
const fileProspects = 'src/components/bde/BDEProspects.jsx';
let propCode = fs.readFileSync(fileProspects, 'utf8');

if (propCode.includes("const isProspect = l.installDateBooked && !l.tokenPaid && !l.convertedProjectId;")) {
  propCode = propCode.replace(
    /const isProspect = l\.installDateBooked && !l\.tokenPaid && !l\.convertedProjectId;/,
    `const isAU = l.country === 'australia' || l.country === 'AU';
    const isEligibleForOrderJourney = isAU ? l.bdeMovedToOrderJourney : (l.tokenPaid && l.assignedEPCId);
    const isProspect = l.installDateBooked && !isEligibleForOrderJourney;`
  );
}

// EPC assignment and move to order button
const newCol3 = `              {/* Col 3: Action Buttons & EPC Status */}
              <div className="flex-1 min-w-[250px] w-full lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center gap-3">
                <div className="hidden lg:block absolute top-4 right-4">
                  <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold">PROSPECT</span>
                </div>

                {/* EPC Assignment Status */}
                {lead.assignedEPCId ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center">
                    <p className="text-[10px] font-black uppercase text-emerald-700 flex items-center justify-center gap-1">
                      ✅ EPC Assigned
                    </p>
                    <p className="text-[10px] text-emerald-600 font-bold truncate mt-0.5">{lead.assignedEPCName || 'Installer Partner'}</p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
                    <p className="text-[10px] font-black uppercase text-amber-700 flex items-center justify-center gap-1">
                      ⏳ Waiting for EPC Assignment
                    </p>
                    <p className="text-[9px] text-amber-600 mt-0.5 leading-tight">Installer needs to accept the project</p>
                  </div>
                )}

                {/* Move to Order Journey / Token Payment */}
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
                </div>
              </div>`;

propCode = propCode.replace(/\{\/\* Col 3: Action Buttons \*\/\}[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*\)\)\})/m, newCol3 + "\n");

fs.writeFileSync(fileProspects, propCode);
console.log('Restored BDEProspects!');
