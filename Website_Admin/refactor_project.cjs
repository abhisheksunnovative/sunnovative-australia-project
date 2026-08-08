const fs = require('fs');

let code = fs.readFileSync('src/components/ProjectScreen.jsx', 'utf8');

// 1. Imports
code = code.replace(/import React, \{ useState \} from \"react\";/, 'import React, { useState, useEffect } from "react";\nimport { useAdminSettings } from "../hooks/useAdminSettings";\nimport { SUPPORTED_COUNTRIES, getStatesForCountry, getDistrictsForState } from "../utils/geography";');

// 2. Add state for filters
const oldState = `  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");`;

const newState = `  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState("india");
  const { projectTypes: solarTypes } = useAdminSettings(filterCountry);
  const availableStates = getStatesForCountry(filterCountry);
  const [filterState, setFilterState] = useState("");
  const availableDistricts = getDistrictsForState(filterCountry, filterState);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    setFilterState(availableStates[0] || "");
    setFilterType("");
  }, [filterCountry]);
  
  useEffect(() => {
    setFilterDistrict(getDistrictsForState(filterCountry, filterState)[0] || "");
  }, [filterState]);`;

code = code.replace(oldState, newState);

// 3. Update filtering logic
const oldFilterLogic = `    const matchesSearch =
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || p.projectType === filterType;
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;`;

const newFilterLogic = `    const matchesSearch =
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || p.projectType === filterType;
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    // We assume projects might need to match country/state/district in the future,
    // for now we just filter type strictly.
    return matchesSearch && matchesType && matchesStatus;`;

code = code.replace(oldFilterLogic, newFilterLogic);

// 4. Update the filter bar UI
const oldFilterUI = `          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 bg-gray-50 w-full md:w-64"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="All">All Types (Scale Ranges)</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Utility Scale">Utility Scale</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="New">New Unassigned</option>
              <option value="Assigned">Assigned to Partner</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>`;

const newFilterUI = `          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 bg-gray-50 w-full md:w-64"
              />
            </div>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {SUPPORTED_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {solarTypes?.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="New">New Unassigned</option>
              <option value="Assigned">Assigned to Partner</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>`;

code = code.replace(oldFilterUI, newFilterUI);

// 5. Update the form select for Project Type to be dynamic
const oldFormType = `                <select
                  value={formData.projectType || "Residential"}
                  onChange={(e) =>
                    setFormData({ ...formData, projectType: e.target.value })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                >
                  <option value="Residential">Residential Solar</option>
                  <option value="Commercial">Commercial Grid</option>
                  <option value="Industrial">Industrial high-load</option>
                  <option value="Utility Scale">Utility Scale solar</option>
                </select>`;

const newFormType = `                <select
                  value={formData.projectType || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, projectType: e.target.value })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                >
                  {solarTypes?.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>`;

code = code.replace(oldFormType, newFormType);

fs.writeFileSync('src/components/ProjectScreen.jsx', code);
console.log('ProjectScreen refactored successfully.');
