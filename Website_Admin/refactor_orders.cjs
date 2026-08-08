const fs = require('fs');

let code = fs.readFileSync('src/components/Projectordersscreen.jsx', 'utf8');

// 1. Imports
code = code.replace(/import React, \{ useState, useEffect, useCallback \} from \"react\";/, 'import React, { useState, useEffect, useCallback } from "react";\nimport { SUPPORTED_COUNTRIES, getStatesForCountry, getDistrictsForState } from "../utils/geography";');

// 2. State & default filters
const oldStateInit = `  const [filterCountry, setFilterCountry] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");`;

const newStateInit = `  const [filterCountry, setFilterCountry] = useState("india");
  const availableStates = getStatesForCountry(filterCountry);
  const [filterState, setFilterState] = useState("");
  const availableDistricts = getDistrictsForState(filterCountry, filterState);
  const [filterDistrict, setFilterDistrict] = useState("");
  
  useEffect(() => {
    setFilterState(availableStates[0] || "");
  }, [filterCountry]);
  
  useEffect(() => {
    setFilterDistrict(getDistrictsForState(filterCountry, filterState)[0] || "");
  }, [filterState]);`;

code = code.replace(oldStateInit, newStateInit);

// 3. Update the Select dropdowns in the UI
const oldSelects = `        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40">
          <option value="">All Countries</option>
          <option value="India">India</option>
          <option value="Australia">Australia</option>
          <option value="New Zealand">New Zealand</option>
        </select>
        <input type="text" value={filterState} onChange={e => setFilterState(e.target.value)} placeholder="Filter State"
            className="w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />
        <input type="text" value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} placeholder="Filter District"
            className="w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />`;

const newSelects = `        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 cursor-pointer">
          {SUPPORTED_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={filterState} onChange={e => setFilterState(e.target.value)} disabled={!filterCountry}
          className="w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 cursor-pointer disabled:opacity-50">
          {availableStates.map(st => <option key={st} value={st}>{st}</option>)}
        </select>
        <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} disabled={!filterState}
          className="w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 cursor-pointer disabled:opacity-50">
          {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>`;

code = code.replace(oldSelects, newSelects);

fs.writeFileSync('src/components/Projectordersscreen.jsx', code);
console.log('Projectordersscreen refactored successfully.');
