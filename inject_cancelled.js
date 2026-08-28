const fs = require('fs');
let text = fs.readFileSync('Website_Frontend/src/customer/CustomerPortal.jsx', 'utf-8');

text = text.replace('const active = projects.filter(p => !["completed","closed","cancelled"].includes(p.status));', 'const active = projects.filter(p => !["completed","closed","cancelled","Cancelled","Lost"].includes(p.status));');
text = text.replace('const done = projects.filter(p => ["completed","closed"].includes(p.status));', 'const done = projects.filter(p => ["completed","closed"].includes(p.status));\n  const cancelledList = projects.filter(p => ["cancelled","Cancelled","Lost"].includes(p.status));');

// Render cancelled projects below active
const activeMapRender = `
                {active.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-10 text-center">
`;

const renderCode = `
                {/* Cancelled Projects */}
                {cancelledList.length > 0 && (
                  <div className="mt-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Cancelled Orders ({cancelledList.length})</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {cancelledList.map(p => (
                        <div key={p._id} className="relative group bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:border-red-300 transition overflow-hidden cursor-not-allowed">
                          {/* Red Hover Overlay */}
                          <div className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center font-black text-2xl opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            CANCELLED
                          </div>
                          <div className="flex justify-between items-start opacity-50 grayscale">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                                  <XCircle className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Order Cancelled
                                </span>
                              </div>
                              <h3 className="text-lg font-black text-slate-800 line-through">{p.projectTypeLabel || p.projectType} Solar</h3>
                              <p className="text-[10px] text-slate-400 font-medium">Order #{p.orderNumber}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
`;

const insertIndex = text.indexOf('{active.length === 0 ? (');
if(insertIndex !== -1) {
    text = text.slice(0, insertIndex) + renderCode + text.slice(insertIndex);
}

fs.writeFileSync('Website_Frontend/src/customer/CustomerPortal.jsx', text);
