const fs = require('fs');
const file = 'src/customer/CustomerPortal.jsx';
let code = fs.readFileSync(file, 'utf8');

// Patch 1: Block application if bill is missing
const handleApplyOld = `  const handleApply = (pkg, state, stateSubsidy, minBookingDays) => {
    const isAU = country === "AU" || customer?.country === "australia";
    const leadTypeSlug = customer?.latestLead?.solarType || "";
    const leadKw = Number(customer?.latestLead?.kw || 0);`;

const handleApplyNew = `  const handleApply = (pkg, state, stateSubsidy, minBookingDays) => {
    if (!customer?.latestLead?.billUrl && !customer?.latestLead?.billAmount) {
      alert("⚠️ Pending Utility Bill Upload:\\n\\nPlease wait for your consultant to upload your recent electricity bill before starting your application. This is required so we can recommend the best system size for you.");
      return;
    }
    const isAU = country === "AU" || customer?.country === "australia";
    const leadTypeSlug = customer?.latestLead?.solarType || "";
    const leadKw = Number(customer?.latestLead?.kw || 0);`;

code = code.replace(handleApplyOld, handleApplyNew);

// Patch 2: Add "Recommended" badge in ApplyModal capacities map
const capacityMapOld = `                  availableCapacities.map(cap => (
                    <div key={cap._id} onClick={() => setSelectedCapacity(cap)}
                      className={\`border p-3 rounded-xl cursor-pointer transition \${selectedCapacity?._id === cap._id ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 hover:border-yellow-200'}\`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{cap.systemSizeKW} kW System</p>
                          <p className="text-[10px] text-slate-500">Estimated STC Rebate: \${cap.estimatedSubsidy || calculateSTC(cap.systemSizeKW)}</p>
                        </div>`;

const capacityMapNew = `                  availableCapacities.map(cap => {
                    const isRecommended = Number(cap.systemSizeKW) === Number(customerLead?.kw || 0);
                    return (
                    <div key={cap._id} onClick={() => setSelectedCapacity(cap)}
                      className={\`relative border p-3 rounded-xl cursor-pointer transition \${selectedCapacity?._id === cap._id ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 hover:border-yellow-200'}\`}>
                      {isRecommended && (
                        <div className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                          <CheckCircle2 className="w-3 h-3" /> Recommended
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{cap.systemSizeKW} kW System</p>
                          <p className="text-[10px] text-slate-500">Estimated STC Rebate: \${cap.estimatedSubsidy || calculateSTC(cap.systemSizeKW)}</p>
                        </div>`;

code = code.replace(capacityMapOld, capacityMapNew);
// Fix the closing brace for the map function since I changed it to block body `{ return ( ... ); }`
const capacityMapCloseOld = `                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : modalStep === 2 ? (`;

const capacityMapCloseNew = `                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : modalStep === 2 ? (`;
code = code.replace(capacityMapCloseOld, capacityMapCloseNew);


fs.writeFileSync(file, code);
console.log("CustomerPortal patched for Apply Flow!");
