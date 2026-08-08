const fs = require('fs');

let code = fs.readFileSync('src/components/LiveProjectTrackingScreen.jsx', 'utf8');

// 1. Imports
code = code.replace(/import React, \{ useState, useEffect, useCallback \} from \"react\";/, 'import React, { useState, useEffect, useCallback } from "react";\nimport { useAdminSettings } from "../hooks/useAdminSettings";\nimport { SUPPORTED_COUNTRIES, getStatesForCountry, getDistrictsForState } from "../utils/geography";');

// 2. State & default filters
const oldStateInit = `  const [filterCountry, setFilterCountry] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterProjectType, setFilterProjectType] = useState("");`;

const newStateInit = `  const [filterCountry, setFilterCountry] = useState("india");
  const { projectTypes: solarTypes } = useAdminSettings(filterCountry);
  const availableStates = getStatesForCountry(filterCountry);
  const [filterState, setFilterState] = useState("");
  const availableDistricts = getDistrictsForState(filterCountry, filterState);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterProjectType, setFilterProjectType] = useState("");

  useEffect(() => {
    setFilterState(availableStates[0] || "");
    setFilterProjectType("");
  }, [filterCountry]);
  
  useEffect(() => {
    setFilterDistrict(getDistrictsForState(filterCountry, filterState)[0] || "");
  }, [filterState]);`;

code = code.replace(oldStateInit, newStateInit);

// 3. Remove old map & fetch
const oldMapAndFetch = `  const countryStatesMap = {
    "india": ["Gujarat", "Maharashtra", "Rajasthan", "Delhi", "Karnataka", "Tamil Nadu"],
    "australia": ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia"],
    "united-states": ["California", "Texas", "Florida", "New York"],
    "united-kingdom": ["England", "Scotland", "Wales", "Northern Ireland"]
  };

  const allStates = countryStatesMap[filterCountry] || [];

  useEffect(() => {
    if (!filterCountry) {
      setDiscoms([]);
      setDynamicProjectTypes([]);
      return;
    }
    const fetchCountryData = async () => {
      try {
        let url = \`\${API_BASE}/api/discoms?country=\${filterCountry}\`;
        if (filterState) url += \`&state=\${filterState}\`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) setDiscoms(data.data);

        const typeRes = await fetch(\`\${API_BASE}/api/order-journey-settings?country=\${filterCountry}\`);
        const typeData = await typeRes.json();
        
        // Use the old approach or the new approach if the backend changed
        const countrySettings = typeData.settings?.[filterCountry] || {};
        if (countrySettings.projectTypes) {
          setDynamicProjectTypes(countrySettings.projectTypes.filter(p => p.enabled));
        } else if (typeData.projectTypes) {
           setDynamicProjectTypes(typeData.projectTypes.filter(p => p.enabled));
        }
      } catch (e) {
        console.error("Error loading specific country data", e);
      }
    };
    fetchCountryData();
  }, [filterCountry, filterState]);`;

const newMapAndFetch = `  useEffect(() => {
    if (!filterCountry) {
      setDiscoms([]);
      return;
    }
    const fetchDiscoms = async () => {
      try {
        let url = \`\${API_BASE}/api/discoms?country=\${filterCountry}\`;
        if (filterState) url += \`&state=\${filterState}\`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) setDiscoms(data.data);
      } catch (e) {
        console.error("Error loading discoms", e);
      }
    };
    fetchDiscoms();
  }, [filterCountry, filterState]);`;

code = code.replace(oldMapAndFetch, newMapAndFetch);

// 4. Update the Select dropdowns in the UI
const oldSelects = `        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ID or Name..."
              className="pl-9 pr-4 py-2.5 text-xs font-semibold border border-slate-700 bg-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 w-48 transition-all" />
          </div>

          <select value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setFilterState(""); setFilterDistrict(""); setFilterProjectType(""); }}
            className="px-4 py-2.5 text-xs font-bold border border-slate-700 bg-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all cursor-pointer">
            <option value="">All Countries</option>
            <option value="india">India</option>
            <option value="australia">Australia</option>
            <option value="united-states">United States</option>
            <option value="united-kingdom">United Kingdom</option>
            <option value="new-zealand">New Zealand</option>
          </select>

          <select value={filterState} onChange={e => { setFilterState(e.target.value); setFilterDistrict(""); }} disabled={!filterCountry}
            className="px-4 py-2.5 text-xs font-bold border border-slate-700 bg-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all cursor-pointer disabled:opacity-50">
            <option value="">All States</option>
            {allStates.map(st => <option key={st} value={st}>{st}</option>)}
          </select>

          <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} disabled={!filterCountry}
            className="px-4 py-2.5 text-xs font-bold border border-slate-700 bg-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all cursor-pointer disabled:opacity-50">
            <option value="">All Districts</option>
            <option value="Surat">Surat</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Sydney">Sydney</option>
            <option value="Melbourne">Melbourne</option>
          </select>

          <select value={filterProjectType} onChange={e => setFilterProjectType(e.target.value)} disabled={!filterCountry}
            className="px-4 py-2.5 text-xs font-bold border border-slate-700 bg-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all cursor-pointer disabled:opacity-50">
            <option value="">All Solar Types</option>
            {dynamicProjectTypes.map(pt => <option key={pt.projectType} value={pt.projectType}>{pt.projectTypeLabel || pt.projectType}</option>)}
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-xs font-bold border border-slate-700 bg-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all cursor-pointer">
            <option value="">All Statuses</option>
            {Object.keys(STATUS_CONFIG).map(k => <option key={k} value={k}>{STATUS_CONFIG[k].label}</option>)}
          </select>

        </div>`;

const newSelects = `        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ID or Name..."
              className="pl-9 pr-4 py-2.5 text-xs font-semibold border border-slate-700 bg-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 w-48 transition-all" />
          </div>

          <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
            className="px-4 py-2.5 text-xs font-bold border border-slate-700 bg-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all cursor-pointer">
            {SUPPORTED_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <select value={filterState} onChange={e => setFilterState(e.target.value)} disabled={!filterCountry}
            className="px-4 py-2.5 text-xs font-bold border border-slate-700 bg-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all cursor-pointer disabled:opacity-50">
            {availableStates.map(st => <option key={st} value={st}>{st}</option>)}
          </select>

          <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} disabled={!filterState}
            className="px-4 py-2.5 text-xs font-bold border border-slate-700 bg-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all cursor-pointer disabled:opacity-50">
            {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={filterProjectType} onChange={e => setFilterProjectType(e.target.value)} disabled={!filterCountry}
            className="px-4 py-2.5 text-xs font-bold border border-slate-700 bg-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all cursor-pointer disabled:opacity-50">
            {solarTypes?.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-xs font-bold border border-slate-700 bg-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all cursor-pointer">
            <option value="">All Statuses</option>
            {Object.keys(STATUS_CONFIG).map(k => <option key={k} value={k}>{STATUS_CONFIG[k].label}</option>)}
          </select>
        </div>`;

code = code.replace(oldSelects, newSelects);

// 5. Cleanup unused state
code = code.replace(/const \[dynamicProjectTypes, setDynamicProjectTypes\] = useState\(\[\]\);\n/g, '');

fs.writeFileSync('src/components/LiveProjectTrackingScreen.jsx', code);
console.log('LiveProjectTrackingScreen refactored successfully.');
