
const fs = require("fs");
const path = "D:/sunnovative-australia-website/Website_Admin/src/components/TrustBadgeEpcScreen.jsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace("import {", "import {\n  Globe,\n  Settings,\n  ChevronRight,\n  ArrowLeft,");

const replacement = `
      {/* HIERARCHY NAVIGATION UI */}
      {!currentFormOpen && (
        <div className="flex flex-col h-full bg-slate-50 border border-gray-100 rounded-2xl overflow-hidden mb-6">
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setCardCountry(""); setCardState(""); setCardProjectType(""); }}
                className={\`font-medium \${!cardCountry ? "text-slate-800 font-bold" : "text-slate-500 hover:text-slate-800"}\`}
              >
                Countries
              </button>
              
              {cardCountry && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <button 
                    onClick={() => { setCardState(""); setCardProjectType(""); }}
                    className={\`font-medium \${!cardState ? "text-slate-800 font-bold" : "text-slate-500 hover:text-slate-800"}\`}
                  >
                    <span className="capitalize">{cardCountry}</span>
                  </button>
                </>
              )}

              {cardState && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <button 
                    onClick={() => { setCardProjectType(""); }}
                    className={\`font-medium \${!cardProjectType ? "text-slate-800 font-bold" : "text-slate-500 hover:text-slate-800"}\`}
                  >
                    {cardState}
                  </button>
                </>
              )}

              {cardProjectType && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-800 font-bold">{cardProjectType}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 min-h-[300px]">
            {/* STAGE 1: COUNTRY SELECTION */}
            {!cardCountry && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {countryList.map(c => {
                  const cName = typeof c === "string" ? c : (c.name || c.code || "");
                  const cCode = cName.toLowerCase();
                  const count = dbPartners.filter(p => p.country?.toLowerCase() === cCode).length;
                  
                  return (
                    <div 
                      key={cCode} 
                      onClick={() => { setCardCountry(cCode); setCardState(""); setCardProjectType(""); }}
                      className="bg-white p-5 rounded-2xl border hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-4xl"><Globe className="w-10 h-10 text-slate-300" /></span>
                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">
                          {count} Applications
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors capitalize">{cName}</h3>
                      <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider">CODE: {cCode.toUpperCase()}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* STAGE 2: STATE SELECTION */}
            {cardCountry && !cardState && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.keys(COUNTRY_DATA[cardCountry] || COUNTRY_DATA[Object.keys(COUNTRY_DATA).find(k => k.toLowerCase() === cardCountry) || ""] || {}).map(st => {
                  const count = dbPartners.filter(p => p.country?.toLowerCase() === cardCountry && p.state?.toLowerCase() === st.toLowerCase()).length;
                  return (
                    <div 
                      key={st} 
                      onClick={() => { setCardState(st); setCardProjectType(""); }}
                      className="bg-white p-5 rounded-2xl border hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-4xl"><MapPin className="w-10 h-10 text-indigo-300" /></span>
                        <span className="px-2 py-1 rounded text-xs font-bold bg-indigo-50 text-indigo-700">
                          {count} Applications
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{st}</h3>
                      <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider">STATE / PROVINCE</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* STAGE 3: PROJECT TYPE SELECTION */}
            {cardCountry && cardState && !cardProjectType && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {dynamicProjectTypeList.map(pt => {
                  const count = dbPartners.filter(p =>
                    p.country?.toLowerCase() === cardCountry &&
                    p.state?.toLowerCase() === cardState.toLowerCase() &&
                    (p.projectTypes || []).some(t => t.toLowerCase() === pt.toLowerCase())
                  ).length;
                  return (
                    <div 
                      key={pt} 
                      onClick={() => setCardProjectType(pt)}
                      className="bg-white p-5 rounded-2xl border hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-4xl"><Settings className="w-10 h-10 text-emerald-300" /></span>
                        <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-700">
                          {count} Applications
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{pt}</h3>
                      <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider">PROJECT CATEGORY</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* IF NO SELECTION, DO NOT SHOW TABLE */}
            {cardCountry && cardState && cardProjectType && filteredPartners.length === 0 && (
               <div className="flex items-center justify-center p-12 text-slate-500">
                 No Trust Badge Applications found for this category.
               </div>
            )}
          </div>
        </div>
      )}
`;

const lines = content.split("\n");
const startIdx = lines.findIndex(l => l.includes("{/* FILTER & OPERATIONAL BOARD */}"));
const endIdx = lines.findIndex(l => l.includes("          <MasterFilterBar"));
const endIdx2 = lines.findIndex(l => l.includes("        </div>")) + 1; // closes the master filter bar wrapper
// The actual end is the line before `      {/* --- FORM BOARD: ADD OR EDIT EPC --- */}`

if (startIdx !== -1) {
    let exactEndIdx = lines.findIndex((l, i) => i > startIdx && l.includes("{/* --- FORM BOARD: ADD OR EDIT EPC --- */}"));
    lines.splice(startIdx, exactEndIdx - startIdx, replacement);
}

// Now wrap the table in the condition
const tableStartIdx = lines.findIndex(l => l.includes("{/* --- DATA TABLE: RENDER PRIMARY ACTIVE EPC GRID --- */}"));
if (tableStartIdx !== -1) {
    let nextLineIdx = tableStartIdx + 1;
    if (lines[nextLineIdx].includes("{!currentFormOpen && (")) {
        lines[nextLineIdx] = "      {!currentFormOpen && cardCountry && cardState && cardProjectType && filteredPartners.length > 0 && (";
    }
}

fs.writeFileSync(path, lines.join("\n"));
console.log("Replaced successfully!");

