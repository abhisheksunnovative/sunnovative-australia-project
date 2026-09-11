const fs = require('fs');

const path = 'src/components/LeadForm.jsx';
let content = fs.readFileSync(path, 'utf8');

const startMarker = '{/* --- DYNAMIC FIELDS (from Admin Panel Form Builder) --- */}';
const endMarker = '{/* 3. Recommended System & Subsidy (Auto-calculated, read-only) */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log('Markers not found!');
  process.exit(1);
}

const replacement = `{/* 1. Bill Fetch / Upload Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 mt-1">1. Electricity Bill Check</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isAU ? "Upload Electricity Bill (AGL / Origin etc.)" : "Upload Light Bill for Auto-Scan"}
                  </label>
                  <div
                    onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                    onClick={handleTriggerFileInput}
                    className={\`border border-dashed rounded-xl p-2.5 text-center cursor-pointer transition-all \${
                      dragActive ? "border-solar-sky bg-sky-50/50" : uploadedFile ? "border-solar-green bg-emerald-50/20" : "border-slate-300 bg-slate-50/50 hover:bg-slate-100/80"
                    }\`}
                    id="drag-drop-container"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" id="bill-file-input" />
                    {isScanning ? (
                      <div className="flex items-center justify-center gap-2 py-0.5">
                        <ScanLine className="w-4 h-4 text-solar-sky animate-pulse" />
                        <p className="text-xs font-bold text-slate-800">Scanning bill...</p>
                      </div>
                    ) : uploadedFile ? (
                      <div className="flex items-center justify-center gap-2 py-0.5">
                        <FileCheck className="w-4 h-4 text-solar-green" />
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{uploadedFile.name}</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-0.5">
                        <UploadCloud className="w-4 h-4 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-700">Drag & drop or click to upload bill</p>
                      </div>
                    )}
                  </div>
                  {scanError && (
                    <div className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" /> {scanError}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAU ? "Or Enter Quarterly Bill Manually" : "Or Enter Average Bill Manually"}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{isAU ? "$" : "₹"}</span>
                    <input type="number" required value={monthlyBill}
                      onChange={(e) => { setMonthlyBill(Number(e.target.value)); setEligibilityResult(null); setSelectedKw(null); }}
                      placeholder="e.g. 2150"
                      className="w-full pl-7 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium italic mt-1">{isAU ? \`Average Monthly Bill: \${Math.round(monthlyBill / 3)}\` : \`Used for calculating system size.\`}</p>
                </div>
              </div>
            </div>

            {/* --- DYNAMIC FIELDS (from Admin Panel Form Builder) --- */}
            {hasDynamicFields ? (
              <div className="mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">2. Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {(() => {
                    const dynamicFields = [...formSettings.fields.filter(f => f.key !== 'billFile')];
                    if (!dynamicFields.find(f => f.key === 'tariffDesc')) dynamicFields.push({ label: 'Tariff', key: 'tariffDesc', type: 'text', required: false, options: [] });
                    if (!dynamicFields.find(f => f.key === 'meterCategory')) dynamicFields.push({ label: 'Meter Category', key: 'meterCategory', type: 'text', required: false, options: [] });
                    if (!dynamicFields.find(f => f.key === 'discom')) dynamicFields.push({ label: 'Discom / Retailer', key: 'discom', type: 'text', required: false, options: [] });
                    
                    const contactKeys = ['mobile', 'email', 'state', 'city', 'postcode', 'district'];
                    const contactFields = dynamicFields.filter(f => contactKeys.some(k => f.key.toLowerCase().includes(k)));
                    
                    return contactFields.map((field, idx) => renderDynamicField(field, idx));
                  })()}
                </div>

                {uploadedFile && !isScanning && !scanError && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center gap-2">
                      <ScanLine className="w-3.5 h-3.5 text-solar-sky" /> Scanned Details
                    </h3>
                    <div className="text-[10.5px] text-orange-600 font-semibold mb-3 flex items-start gap-1 bg-orange-50 p-1.5 rounded-md border border-orange-100">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                      <span>Note: Verify the auto-filled details. AI can sometimes make mistakes. If anything looks incorrect, please manually edit these fields.</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {(() => {
                        const dynamicFields = [...formSettings.fields.filter(f => f.key !== 'billFile')];
                        if (!dynamicFields.find(f => f.key === 'tariffDesc')) dynamicFields.push({ label: 'Tariff', key: 'tariffDesc', type: 'text', required: false, options: [] });
                        if (!dynamicFields.find(f => f.key === 'meterCategory')) dynamicFields.push({ label: 'Meter Category', key: 'meterCategory', type: 'text', required: false, options: [] });
                        if (!dynamicFields.find(f => f.key === 'discom')) dynamicFields.push({ label: 'Discom / Retailer', key: 'discom', type: 'text', required: false, options: [] });
                        
                        const contactKeys = ['mobile', 'email', 'state', 'city', 'postcode', 'district'];
                        const otherFields = dynamicFields.filter(f => !contactKeys.some(k => f.key.toLowerCase().includes(k)));
                        
                        return otherFields.map((field, idx) => renderDynamicField(field, idx));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
            /* --- DEFAULT FIELDS (fallback) --- */
            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5">2. Contact & Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">State *</label>
                  <select
                    value={customerState}
                    onChange={(e) => { setCustomerState(e.target.value); setEligibilityResult(null); }}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer font-medium"
                  >
                    {(countryStatesMap[country] || countryStatesMap["IN"]).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAU ? "Suburb / City *" : "District / City *"}</label>
                  {isAU ? (
                    <div className="flex gap-2">
                      <input type="text" required value={city} onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Parramatta"
                        className="w-2/3 px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium" />
                      <input type="text" required value={postcode} onChange={(e) => setPostcode(e.target.value.replace(/\\D/g, ""))} maxLength={4}
                        placeholder="Postcode"
                        className="w-1/3 px-2.5 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium" />
                    </div>
                  ) : (
                    <select value={city} onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all cursor-pointer font-medium">
                      {!["Rajkot", "Morbi", "Jamnagar", "Gondal", "Jetpur", "Jasdan", "Wankaner"].includes(city) && (
                        <option value={city}>{city}</option>
                      )}
                      <option value="Rajkot">Rajkot</option>
                      <option value="Morbi">Morbi</option>
                      <option value="Jamnagar">Jamnagar</option>
                      <option value="Gondal">Gondal</option>
                      <option value="Jetpur">Jetpur</option>
                      <option value="Jasdan">Jasdan</option>
                      <option value="Wankaner">Wankaner</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-solar-sky focus-within:bg-white transition-all">
                    <div className="px-2.5 py-2 text-xs font-bold text-slate-500 bg-slate-100 border-r border-slate-200 flex shrink-0 items-center gap-1.5">
                      {isAU ? <span className="text-[13px]">🇦🇺</span> : <span className="text-[13px]">🇮🇳</span>}
                      {isAU ? "+61" : "+91"}
                    </div>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\\D/g, ""))} maxLength={isAU ? 9 : 10}
                      placeholder={isAU ? "400 000 000" : "9876543210"}
                      className="w-full px-3 py-2 text-xs text-slate-800 bg-transparent border-none focus:ring-0 outline-none font-medium invalid:[&:not(:placeholder-shown):not(:focus)]:text-red-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Mail className="w-3.5 h-3.5" /></span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-8 pr-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500 invalid:[&:not(:placeholder-shown):not(:focus)]:ring-red-500" />
                  </div>
                </div>
              </div>
              
              {/* Dynamic Brand Selections */}
              {productCategories.length > 0 && (
                <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 mb-2">Preferred Brands (Optional)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {productCategories.map(cat => (
                      <div key={cat}>
                        <label className="block text-[10px] text-slate-500 mb-1">{cat}</label>
                        <select 
                          value={preferredBrands[cat] || ""}
                          onChange={(e) => setPreferredBrands(prev => ({...prev, [cat]: e.target.value}))}
                          className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium"
                        >
                          <option value="">No Preference</option>
                          {availableBrands.filter(b => b.products && b.products.includes(cat)).map(brand => (
                            <option key={brand._id || brand.id} value={brand._id || brand.id}>{brand.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadedFile && !isScanning && !scanError && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center gap-2">
                    <ScanLine className="w-3.5 h-3.5 text-solar-sky" /> Scanned Details
                  </h3>
                  <div className="text-[10.5px] text-orange-600 font-semibold mb-3 flex items-start gap-1 bg-orange-50 p-1.5 rounded-md border border-orange-100">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                    <span>Note: Verify the auto-filled details. AI can sometimes make mistakes. If anything looks incorrect, please manually edit these fields.</span>
                  </div>
                  {/* Additional fallback scanned details if needed, usually we don't render them separately in fallback since they are captured in state */}
                </div>
              )}
            </div>
            )}

            `;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(path, newContent);
console.log('Successfully updated LeadForm.jsx layout.');
