const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Frontend/src/customer/CustomerPortal.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Dynamic Hero bg
content = content.replace(
  '<div className="bg-gradient-to-br from-solar-navy via-slate-800 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">',
  '\\n      <div className={g-gradient-to-br  rounded-3xl p-6 text-white relative overflow-hidden}>'
);

// 2. Add EPC recommendation block
const epcBlock = 
      {/* Australia BDE EPC Recommendation Block */}
      {project.bdeRecommendationStatus === "pending" && project.recommendedEpcs?.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0 shadow-sm text-white">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-blue-950">Recommended Installers</h3>
              <p className="text-xs font-medium text-blue-800 mt-0.5">Humare BDE ne aapke project ke liye {project.recommendedEpcs.length} best EPCs select kiye hain. Kripya ek chunein.</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {project.recommendedEpcs.map(epc => (
              <div key={epc._id} className="bg-white border border-blue-100 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-black text-slate-800">{epc.companyName}</p>
                  <p className="text-xs text-slate-500">{epc.city}, {epc.state} • ⭐ {epc.rating} Rating</p>
                </div>
                <button 
                  onClick={async () => {
                    if (window.confirm(\Kya aap \ ko as a installer accept karna chahte hain?\)) {
                      try {
                        const res = await authFetch(\/api/customer/projects/\/accept-epc\, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ epcId: epc._id, epcName: epc.companyName })
                        });
                        const d = await res.json();
                        if (d.success) {
                          alert("EPC Successfully Assigned! 🚀");
                          fetchProject();
                        } else alert(d.message || "Failed to accept EPC");
                      } catch(e) { alert("Error connecting to server"); }
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm whitespace-nowrap"
                >
                  Accept & Assign
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={async () => {
              if (window.confirm("Are you sure you want to reject all recommendations and request new ones?")) {
                try {
                  const res = await authFetch(\/api/customer/projects/\/reject-epcs\, { method: "POST" });
                  const d = await res.json();
                  if (d.success) {
                    alert("Recommendations rejected. Your BDE will send new ones soon.");
                    fetchProject();
                  } else alert(d.message);
                } catch(e) { alert("Error connecting to server"); }
              }
            }}
            className="w-full mt-4 py-2 border border-blue-200 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition"
          >
            Reject All & Request New
          </button>
        </div>
      )}
;

content = content.replace(
  '      {/* EPC Partner */}',
  epcBlock + '\\n      {/* EPC Partner */}'
);

// 3. Dynamic List Cards for active and completed
content = content.replace(
  '{active.map(p => (\\n                        <div key={p._id} className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all group"',
  \{active.map(p => {
    const isComm = p.projectType?.toLowerCase().includes("commercial") || p.projectType?.toLowerCase().includes("industrial");
    const isAgri = p.projectType?.toLowerCase().includes("agri");
    const isOffGrid = p.projectType?.toLowerCase().includes("off-grid") || p.projectType?.toLowerCase().includes("off grid");
    const cardBg = isComm ? "bg-orange-50/50 border-orange-200" : isAgri ? "bg-green-50/50 border-green-200" : isOffGrid ? "bg-purple-50/50 border-purple-200" : "bg-white border-blue-100";
    const headerCol = isComm ? "text-orange-900" : isAgri ? "text-green-900" : isOffGrid ? "text-purple-900" : "text-slate-700";
    return (
      <div key={p._id} className={\\ border rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all group\}\
);

content = content.replace(
  '<p className="font-black text-slate-800 text-base group-hover:text-solar-sky transition-colors">{p.projectTypeLabel || p.projectType} Solar</p>',
  '<p className={ont-black  text-base group-hover:text-solar-sky transition-colors}>{p.projectTypeLabel || p.projectType} Solar</p>'
);

fs.writeFileSync(file, content);
console.log("Done");
