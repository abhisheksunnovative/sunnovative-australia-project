const fs = require('fs');

let code = fs.readFileSync('src/components/LeadScreen.jsx', 'utf8');

// 1. Imports
code = code.replace(/import React, \{ useState, useEffect, useCallback \} from \"react\";/, 'import React, { useState, useEffect, useCallback } from "react";\nimport { useAdminSettings } from "../hooks/useAdminSettings";\nimport { SUPPORTED_COUNTRIES, getStatesForCountry, getDistrictsForState } from "../utils/geography";');

// 2. Remove SOLAR_TYPES
code = code.replace(/const SOLAR_TYPES = \[[\s\S]*?\];/, '');

// 3. CreateLeadModal signature & fields
code = code.replace(/const CreateLeadModal = \(\{ onClose, onSuccess \}\) => \{/, 'const CreateLeadModal = ({ onClose, onSuccess, solarTypes, filterCountry }) => {');
code = code.replace(/\{ label: "State", key: "state", placeholder: "e\.g\. Gujarat" \},\s*\{ label: "District", key: "district", placeholder: "e\.g\. Rajkot" \},/, '');

// 4. CreateLeadModal dropdowns
const oldDropdowns = `          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Solar Type *</label>
            <select value={form.solarType} onChange={e => set("solarType", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white">
              {SOLAR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>`;

const newDropdowns = `          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">State *</label>
            <select value={form.state} onChange={e => { set("state", e.target.value); set("district", ""); }} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white">
              <option value="">Select State</option>
              {getStatesForCountry(filterCountry).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">District *</label>
            <select value={form.district} onChange={e => set("district", e.target.value)} disabled={!form.state} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white disabled:opacity-50">
              <option value="">Select District</option>
              {getDistrictsForState(filterCountry, form.state).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Solar Type *</label>
            <select value={form.solarType} onChange={e => set("solarType", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white">
              {solarTypes?.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>`;

code = code.replace(oldDropdowns, newDropdowns);

// 5. LeadDetailModal
code = code.replace(/const LeadDetailModal = \(\{ lead, onClose, onUpdate, onConvert \}\) => \{/, 'const LeadDetailModal = ({ lead, onClose, onUpdate, onConvert, solarTypes }) => {');
code = code.replaceAll('SOLAR_TYPES', 'solarTypes');

// 6. LeadScreen state initialization
const oldStateInit = `  const [typeFilter, setTypeFilter] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");`;

const newStateInit = `  const [filterCountry, setFilterCountry] = useState("india");
  const { projectTypes: solarTypes } = useAdminSettings(filterCountry);
  const availableStates = getStatesForCountry(filterCountry);
  const [filterState, setFilterState] = useState("");
  const availableDistricts = getDistrictsForState(filterCountry, filterState);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  // Reset dependents when country changes
  useEffect(() => {
    setFilterState(availableStates[0] || "");
    setTypeFilter("");
  }, [filterCountry]);
  
  useEffect(() => {
    setFilterDistrict(getDistrictsForState(filterCountry, filterState)[0] || "");
  }, [filterState]);`;

code = code.replace(oldStateInit, newStateInit);

// 7. Modals rendering
code = code.replace(/<CreateLeadModal onClose=\{[\s\S]*? \/>/, '<CreateLeadModal onClose={() => setShowCreate(false)} onSuccess={fetchLeads} solarTypes={solarTypes} filterCountry={filterCountry} />');
code = code.replace(/<LeadDetailModal lead=\{selectedLead\}[\s\S]*? \/>/, '<LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={fetchLeads} onConvert={() => {}} solarTypes={solarTypes} />');

// 8. Top filter bar
const oldFilters = `        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium">
          <option value="">All Solar Types</option>
          {solarTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium">
          <option value="">All Countries</option>
          <option value="India">India</option>
          <option value="Australia">Australia</option>
          <option value="New Zealand">New Zealand</option>
        </select>
        <input type="text" value={filterState} onChange={e => setFilterState(e.target.value)} placeholder="Filter State"
            className="w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium" />
        <input type="text" value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} placeholder="Filter District"
            className="w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium" />`;

const newFilters = `        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium min-w-32">
          {SUPPORTED_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={filterState} onChange={e => setFilterState(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium min-w-32">
          {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium min-w-32">
          {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 font-medium min-w-40">
          {solarTypes?.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>`;

code = code.replace(oldFilters, newFilters);

fs.writeFileSync('src/components/LeadScreen.jsx', code);
console.log('LeadScreen refactored successfully.');
