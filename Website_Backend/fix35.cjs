const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let code = fs.readFileSync(path, 'utf8');

const oldRedBox = `{eligibilityResult && eligibilityResult.isEligible === false ? (
               <div className="bg-red-50 rounded-xl border border-red-200 p-4 mt-2">
                 <h3 className="text-sm font-bold text-red-900 mb-1">Recommendation Unavailable</h3>
                 <p className="text-xs text-red-700">{eligibilityResult.reasons?.[0] || 'Your bill does not meet the requirements for an automatic recommendation. Please provide a valid, recent bill.'}</p>
               </div>
            ) : (`;

const newRedBox = `{eligibilityResult && eligibilityResult.isEligible === false ? (
               <div className="bg-red-50 rounded-xl border border-red-200 p-4 mt-2">
                 {scanFallbackReason === 'Bill date not found — cannot verify recency' ? (
                   <div>
                     <h3 className="text-sm font-bold text-red-900 mb-1">Bill Issue Date Missing</h3>
                     <p className="text-xs text-red-700 mb-3">We couldn't extract the Bill Issue Date. Please enter it manually to get your recommendation.</p>
                     <div className="flex gap-2 items-center">
                       <input type="date" className="p-2 text-xs border rounded-lg flex-1" value={manualBillDate} onChange={(e) => setManualBillDate(e.target.value)} />
                       <button 
                         className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold whitespace-nowrap"
                         onClick={() => {
                           if (!manualBillDate) return alert("Please select a date first");
                           handleCheckEligibility({
                             meterCategory: meterCategory,
                             billAmount: monthlyBill,
                             monthlyUnits: ocrMonthlyUnits,
                             dueAmount: dueAmount,
                             billStatus: billStatus,
                             monthsOverdue: 0,
                             billDate: manualBillDate,
                             passedState: customerState,
                             criticalFieldsConfirmed: true, // We are providing the date manually
                             isCustomerVerified: false
                           });
                         }}
                       >
                         Update & Retry
                       </button>
                     </div>
                   </div>
                 ) : (
                   <>
                     <h3 className="text-sm font-bold text-red-900 mb-1">Recommendation Unavailable</h3>
                     <p className="text-xs text-red-700">{scanFallbackReason || eligibilityResult.reasons?.[0] || 'Your bill does not meet the requirements for an automatic recommendation. Please provide a valid, recent bill.'}</p>
                   </>
                 )}
               </div>
            ) : (`;

if (code.includes(oldRedBox)) {
  code = code.replace(oldRedBox, newRedBox);
} else if (code.includes(oldRedBox.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldRedBox.replace(/\n/g, '\r\n'), newRedBox.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(path, code);
console.log('Updated Red Box UI');
