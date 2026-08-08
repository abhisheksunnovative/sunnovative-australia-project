export const SUPPORTED_COUNTRIES = [
  { value: "india", label: "India" },
  { value: "australia", label: "Australia" },
  { value: "united-states", label: "United States" },
  { value: "united-kingdom", label: "United Kingdom" },
  { value: "new-zealand", label: "New Zealand" }
];

export const COUNTRY_DATA = {
  "india": {
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubli-Dharwad", "Mangaluru", "Belagavi", "Davangere"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"]
  },
  "australia": {
    "New South Wales": ["Sydney", "Newcastle", "Central Coast", "Wollongong", "Maitland", "Tweed Heads"],
    "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Melton", "Shepparton"],
    "Queensland": ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns", "Toowoomba"],
    "Western Australia": ["Perth", "Mandurah", "Bunbury", "Geraldton", "Kalgoorlie", "Albany"],
    "South Australia": ["Adelaide", "Mount Gambier", "Gawler", "Whyalla", "Murray Bridge"],
    "Tasmania": ["Hobart", "Launceston", "Devonport", "Burnie"],
    "Australian Capital Territory": ["Canberra"],
    "Northern Territory": ["Darwin", "Alice Springs", "Palmerston"]
  },
  "united-states": {
    "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Fresno"],
    "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee", "Fort Lauderdale"],
    "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany"],
    "Illinois": ["Chicago", "Aurora", "Joliet", "Naperville", "Springfield", "Peoria"],
    "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton"]
  },
  "united-kingdom": {
    "England": ["London", "Birmingham", "Manchester", "Leeds", "Liverpool", "Bristol", "Sheffield", "Newcastle"],
    "Scotland": ["Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Inverness", "Stirling"],
    "Wales": ["Cardiff", "Swansea", "Newport", "Bangor", "St Davids"],
    "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newry", "Armagh"]
  },
  "new-zealand": {
    "North Island": ["Auckland", "Wellington", "Hamilton", "Tauranga", "Napier-Hastings", "Palmerston North"],
    "South Island": ["Christchurch", "Dunedin", "Nelson", "Invercargill", "Queenstown"]
  }
};

/**
 * Returns a list of states for a given country.
 * @param {string} country 
 * @returns {string[]}
 */
export const getStatesForCountry = (country) => {
  if (!country || !COUNTRY_DATA[country]) return [];
  return Object.keys(COUNTRY_DATA[country]);
};

/**
 * Returns a list of districts for a given state in a country.
 * @param {string} country 
 * @param {string} state 
 * @returns {string[]}
 */
export const getDistrictsForState = (country, state) => {
  if (!country || !state || !COUNTRY_DATA[country] || !COUNTRY_DATA[country][state]) return [];
  return COUNTRY_DATA[country][state];
};
