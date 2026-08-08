const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'EpcPartnerScreen.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add geography import
if (!content.includes('import { GEOGRAPHY_DATA }')) {
    content = content.replace(
        'import { StatusBadge, RatingStars, DetailDrawer, EmptyState } from "./CommonUI";',
        'import { StatusBadge, RatingStars, DetailDrawer, EmptyState } from "./CommonUI";\nimport { GEOGRAPHY_DATA } from "../utils/geography";'
    );
}

// 2. Replace state definitions
const stateDefsOld = `  // Page states
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [filterDistrict, setFilterDistrict] = useState("All");
  const [filterCity, setFilterCity] = useState("All");`;

const stateDefsNew = `  // Page states
  const availableCountries = Object.keys(GEOGRAPHY_DATA);
  const initialCountry = availableCountries[0];
  const initialStates = Object.keys(GEOGRAPHY_DATA[initialCountry] || {});
  const initialState = initialStates[0] || "";
  const initialDistricts = GEOGRAPHY_DATA[initialCountry]?.[initialState] || [];
  const initialDistrict = initialDistricts[0] || "";

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCountry, setFilterCountry] = useState(initialCountry);
  const [filterState, setFilterState] = useState(initialState);
  const [filterDistrict, setFilterDistrict] = useState(initialDistrict);
  // filterCity is removed or default to empty string if needed, we'll keep it as All for now
  const [filterCity, setFilterCity] = useState("All");`;

content = content.replace(stateDefsOld, stateDefsNew);

// 3. Remove uniqueCountries and uniqueStates calculation
content = content.replace(
    '  const uniqueCountries = Array.from(new Set(dbPartners.map((p) => p.country).filter(Boolean)));\n',
    ''
);
content = content.replace(
    '  const uniqueStates = Array.from(new Set(dbPartners.map((p) => p.state).filter(Boolean)));\n',
    ''
);

// 4. Update the Select dropdowns for Country, State, District
const selectBlockRegex = /\{\/\* Country Filter \*\/\}[\s\S]*?(?=\{\/\* City\/Area Filter \*\/|\{\/\* City \/ Area \*\/)/;

const newSelects = `{/* Country Filter */}
            <select
              value={filterCountry}
              onChange={(e) => {
                const newC = e.target.value;
                setFilterCountry(newC);
                const newStates = Object.keys(GEOGRAPHY_DATA[newC] || {});
                const newS = newStates[0] || "";
                setFilterState(newS);
                const newDistricts = GEOGRAPHY_DATA[newC]?.[newS] || [];
                setFilterDistrict(newDistricts[0] || "");
              }}
              className="text-xs font-semibold bg-white border border-gray-100 rounded-xl px-3 py-2 text-primary focus:outline-hidden focus:border-primary/20"
            >
              {availableCountries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* State Filter */}
            <select
              value={filterState}
              onChange={(e) => {
                const newS = e.target.value;
                setFilterState(newS);
                const newDistricts = GEOGRAPHY_DATA[filterCountry]?.[newS] || [];
                setFilterDistrict(newDistricts[0] || "");
              }}
              className="text-xs font-semibold bg-white border border-gray-100 rounded-xl px-3 py-2 text-primary focus:outline-hidden focus:border-primary/20"
            >
              {Object.keys(GEOGRAPHY_DATA[filterCountry] || {}).map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* District Filter */}
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="text-xs font-semibold bg-white border border-gray-100 rounded-xl px-3 py-2 text-primary focus:outline-none focus:border-primary/20"
            >
              {(GEOGRAPHY_DATA[filterCountry]?.[filterState] || []).map((dst) => (
                <option key={dst} value={dst}>{dst}</option>
              ))}
            </select>

            `;

content = content.replace(selectBlockRegex, newSelects);

// We need to also remove City/Area filter since we removed "All" from everywhere else, 
// or keep it but the user said "remove all from everywhere". If city only has "All Areas/Cities", we can just remove the city dropdown entirely.
const cityBlockRegex = /\{\/\* City\/Area Filter \*\/\}[\s\S]*?(?=<\/div>)/;
content = content.replace(cityBlockRegex, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('EpcPartnerScreen refactored successfully.');
