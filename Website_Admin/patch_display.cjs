const fs = require('fs');
let file = fs.readFileSync('../Website_Frontend/src/customer/CustomerPortal.jsx', 'utf8');

// For India
const indiaReplace = `                ) : customerLead?.billUrl ? (
                  <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-green-700 flex items-center justify-center gap-1">
                      ✓ Document Attached
                    </p>
                    {customerLead.billUrl.match(/\\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src={\`\${import.meta.env.VITE_API_URL || "http://localhost:4005"}\${customerLead.billUrl}\`} alt="bill" className="h-20 w-auto object-contain mt-1 rounded-lg shadow-sm border border-green-200" />
                    ) : (
                      <a href={\`\${import.meta.env.VITE_API_URL || "http://localhost:4005"}\${customerLead.billUrl}\`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline mt-1">View Document</a>
                    )}
                    <p className="text-[10px] text-green-600 mt-1">Click here to replace</p>
                  </div>`;
file = file.replace(/ \) : customerLead\?.billUrl \? \([\s\S]*?<\/div>\s*\) : \(/, indiaReplace + '\n                ) : (');


// For Australia
const auReplace = `                    ) : customerLead?.billUrl ? (
                      <div className="flex flex-col items-center">
                        <p className="text-xs font-bold text-green-700 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Document Attached
                        </p>
                        {customerLead.billUrl.match(/\\.(jpeg|jpg|gif|png)$/i) ? (
                          <img src={\`\${import.meta.env.VITE_API_URL || "http://localhost:4005"}\${customerLead.billUrl}\`} alt="bill" className="h-20 w-auto object-contain mt-1 rounded-lg shadow-sm border border-green-200" />
                        ) : (
                          <a href={\`\${import.meta.env.VITE_API_URL || "http://localhost:4005"}\${customerLead.billUrl}\`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline mt-1">View Document</a>
                        )}
                        <p className="text-[10px] text-green-600 mt-1">Click here to replace</p>
                      </div>`;
file = file.replace(/ \) : customerLead\?.billUrl \? \([\s\S]*?<\/div>\s*\) : \(/, auReplace + '\n                    ) : (');

fs.writeFileSync('../Website_Frontend/src/customer/CustomerPortal.jsx', file);
console.log("Patched CustomerPortal display");
