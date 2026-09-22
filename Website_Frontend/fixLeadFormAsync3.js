import fs from 'fs';

let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

const oldErrorDisplay = /\{eligibilityError && \([\s\S]*?<p className="text-\[11px\] text-red-600 font-medium leading-relaxed">\{eligibilityError\}<\/p>\n\s*<\/div>\n\s*\)\}/m;

const newErrorDisplay = `{eligibilityError && (
              <div className="mt-4 p-4 bg-orange-50/50 border border-orange-100 rounded-xl flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-orange-700 font-medium leading-relaxed">{eligibilityError}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleCheckEligibility({ 
                    meterCategory: meterCategory, 
                    billAmount: monthlyBill, 
                    monthlyUnits: ocrMonthlyUnits, 
                    isCustomerVerified: true 
                  })}
                  className="self-start px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all"
                >
                  Yes, these values are correct -> Generate Quote
                </button>
              </div>
            )}`;

content = content.replace(oldErrorDisplay, newErrorDisplay);

fs.writeFileSync('src/components/LeadForm.jsx', content);
console.log("Orange Box added.");
