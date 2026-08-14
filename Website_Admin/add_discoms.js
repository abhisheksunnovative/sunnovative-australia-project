const API_BASE = 'http://localhost:4005';
const COUNTRY = 'India';

async function fetchDistricts() {
  const res = await fetch(`${API_BASE}/api/districts?country=${COUNTRY}`);
  const data = await res.json();
  let districtsList = data.data || data;
  if (!Array.isArray(districtsList)) districtsList = [];
  
  const uniqueStates = [...new Set(districtsList.map(d => d.state).filter(Boolean))];
  return uniqueStates;
}

async function createDiscom(state, discomName) {
  const res = await fetch(`${API_BASE}/api/discoms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: discomName,
      country: COUNTRY,
      state: state,
      districts: ["All Districts"],
      isActive: true
    })
  });
  
  console.log(`Created discom ${discomName} for ${state}: ${res.status}`);
}

async function run() {
  console.log(`Fetching states for ${COUNTRY}...`);
  try {
    const states = await fetchDistricts();
    console.log(`Found ${states.length} states:`, states);
    
    for (const state of states) {
      await createDiscom(state, `${state} Power Corp`);
      await createDiscom(state, `${state} State Electricity Board`);
    }
    
    console.log('Done populating dummy discoms!');
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
