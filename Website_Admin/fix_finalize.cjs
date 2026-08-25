const fs = require('fs');
let c = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');

const originalFinalize = `<button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <Calendar className="w-4 h-4" /> Finalize Date
                      </button>`;
const originalFinalize2 = `<button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                      <Calendar className="w-4 h-4" /> Finalize Date
                    </button>`;

const newFinalize = `{(lead.hasLoggedIn) ? (
                        <button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <Calendar className="w-4 h-4" /> Finalize Date
                        </button>
                      ) : (
                        <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-bold text-center w-full shadow-sm">
                          Ask customer to login and provide an installation date to unlock Finalize Date.
                        </div>
                      )}`;

c = c.replace(originalFinalize, newFinalize);
c = c.replace(originalFinalize2, newFinalize);

// Also fix the alert message in handleSchedule
c = c.replace('alert("Lead scheduled successfully! After Admin approval, this lead will be broadcast to the EPC portal.");', 'alert("Installation date locked successfully! The lead is now moved to your Prospects.");');

fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', c);
console.log('Fixed Finalize Date button logic and alert!');
