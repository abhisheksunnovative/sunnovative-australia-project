const fs = require('fs');

// 1. Update CountryContext.jsx to fetch reliably without crashing on one failure
let contextCode = fs.readFileSync('src/context/CountryContext.jsx', 'utf8');

const oldEffect = `  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [distRes, countryRes] = await Promise.all([
          epcApi.get('/api/districts'),
          epcApi.get('/api/countries')
        ]);
        
        const distData = distRes.data;
        setAllDistricts(distData.success ? distData.data : (Array.isArray(distData) ? distData : []));

        const countryData = countryRes.data;
        if (countryData.success && Array.isArray(countryData.data)) {
          setCountriesList(countryData.data.filter(c => c.isActive).map(c => c.name));
        } else if (Array.isArray(countryData)) {
          setCountriesList(countryData.filter(c => c.isActive).map(c => c.name));
        }
      } catch (err) {
        console.error("Failed to load locations:", err);
      } finally {
        setLocationsLoading(false);
      }
    };
    fetchLocations();
  }, []);`;

const newEffect = `  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [distRes, countryRes] = await Promise.all([
          epcApi.get('/api/districts').catch(e => { console.error('District fetch failed', e); return { data: { success: false, data: [] } }; }),
          epcApi.get('/api/countries').catch(e => { console.error('Country fetch failed', e); return { data: { success: false, data: [] } }; })
        ]);
        
        const distData = distRes.data;
        if (distData.success && Array.isArray(distData.data)) setAllDistricts(distData.data);
        else if (Array.isArray(distData)) setAllDistricts(distData);
        else setAllDistricts([]);

        const countryData = countryRes.data;
        let cList = [];
        if (countryData.success && Array.isArray(countryData.data)) {
          cList = countryData.data.filter(c => c.isActive !== false).map(c => c.name);
        } else if (Array.isArray(countryData)) {
          cList = countryData.filter(c => c.isActive !== false).map(c => c.name);
        }
        setCountriesList(cList);
      } catch (err) {
        console.error("Failed to load locations:", err);
      } finally {
        setLocationsLoading(false);
      }
    };
    fetchLocations();
  }, []);`;

contextCode = contextCode.replace(oldEffect, newEffect);
fs.writeFileSync('src/context/CountryContext.jsx', contextCode);

// 2. Update EpcLogin.jsx to fix fallback capitalization and logic
let loginCode = fs.readFileSync('src/pages/epc/auth/EpcLogin.jsx', 'utf8');

const oldFallback = `{/* Fallbacks if DB is empty but we still want to show them temporarily, otherwise just map getCountries() */}
                  {getCountries().length === 0 && !locationsLoading && (
                    <>
                      <option value="india">India</option>
                      <option value="australia">Australia</option>
                      <option value="new_zealand">New Zealand</option>
                    </>
                  )}`;

const newFallback = `{/* Fallbacks if DB is empty but we still want to show them temporarily, otherwise just map getCountries() */}
                  {getCountries().length === 0 && !locationsLoading && (
                    <>
                      <option value="India">India</option>
                      <option value="Australia">Australia</option>
                      <option value="New Zealand">New Zealand</option>
                    </>
                  )}`;

loginCode = loginCode.replace(oldFallback, newFallback);
fs.writeFileSync('src/pages/epc/auth/EpcLogin.jsx', loginCode);
