import re

def update_demand_supply():
    with open('D:/sunnovative-australia-website/Website_Admin/src/components/DemandSupplyScreen.jsx', 'r') as f:
        content = f.read()

    # 1. Rename to DemandSupplyContent
    content = content.replace('export const DemandSupplyScreen = () => {', 'export const DemandSupplyContent = ({ selectedCountryObj, onBack }) => {\n  const selectedCountry = selectedCountryObj.code;\n  const selectedCountryName = selectedCountryObj.name;\n')

    # 2. Add the new wrapper at the top
    wrapper = """
export const DemandSupplyScreen = () => {
  const [countries, setCountries] = React.useState([]);
  const [selectedCountryObj, setSelectedCountryObj] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/countries`);
        const data = await res.json();
        if (data.success && data.data) {
          setCountries(data.data.filter(c => c.isActive));
        } else if (Array.isArray(data)) {
          setCountries(data.filter(c => c.isActive));
        }
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading countries...</div>;
  }

  if (!selectedCountryObj) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Demand & Supply Management</h1>
          <p className="text-slate-500">Select a country to manage its regional demand and supply rules.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {countries.map(country => (
            <div 
              key={country._id || country.code}
              onClick={() => setSelectedCountryObj(country)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#28377f] cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{country.flagEmoji}</span>
              <span className="font-bold text-slate-700 group-hover:text-[#28377f]">{country.name}</span>
            </div>
          ))}
          {countries.length === 0 && (
            <p className="text-slate-500 col-span-full">No active countries found. Please configure them in Country Settings.</p>
          )}
        </div>
      </div>
    );
  }

  return <DemandSupplyContent selectedCountryObj={selectedCountryObj} onBack={() => setSelectedCountryObj(null)} />;
};

"""
    content = content.replace('const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";', 'const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";\n' + wrapper)

    # 3. Fix initial state of filters
    content = content.replace('country: "",', 'country: selectedCountry,')

    # 4. Remove the hardcoded country tabs
    country_tabs_regex = re.compile(r'\{\/\* Country Tabs \*\/\}.*?<\/div>', re.DOTALL)
    content = country_tabs_regex.sub('{/* Country Tabs (Removed, locked to {selectedCountryName}) */}', content)

    # 5. Add back button
    content = content.replace('<div className="flex justify-between items-end mb-8 relative z-10">', '<div className="mb-6"><button onClick={onBack} className="text-sm text-blue-600 hover:underline flex items-center gap-1">← Back to Countries</button></div>\n      <div className="flex justify-between items-end mb-8 relative z-10">')

    # 6. Change discoms to districts inside DemandSupplyContent
    content = content.replace('const [discoms, setDiscoms] = useState([]);', 'const [districtsData, setDistrictsData] = useState([]);')
    
    # fetch discoms -> fetch districts
    content = re.sub(
        r'const discomRes = await fetch\([^)]+\);.*?setDiscoms\(discomData\.data\);.*?\}',
        'const distRes = await fetch(`${API_BASE}/api/districts?country=${selectedCountry}`);\n      const distData = await distRes.json();\n      setDistrictsData(distData);',
        content,
        flags=re.DOTALL
    )

    # Replace discoms with districtsData in regional filters
    content = content.replace('discoms.filter(d => (!filters.country || d.country === filters.country) && (!filters.state || d.state === filters.state)).flatMap(d => d.districts)', 'districtsData.filter(d => (!filters.state || d.state === filters.state)).flatMap(d => d.pincodes ? d.pincodes.split(",").map(p => p.trim()) : [d.district])')
    
    content = content.replace('discoms.filter(d => d.state === ruleForm.state).flatMap(d => d.districts)', 'districtsData.filter(d => d.state === ruleForm.state).flatMap(d => d.pincodes ? d.pincodes.split(",").map(p => p.trim()) : [d.district])')

    content = content.replace('discoms.filter(d => !filters.country || d.country === filters.country).map(d => d.state)', 'districtsData.map(d => d.state)')
    content = content.replace('discoms.map(d => d.state)', 'districtsData.map(d => d.state)')


    with open('D:/sunnovative-australia-website/Website_Admin/src/components/DemandSupplyScreen.jsx', 'w') as f:
        f.write(content)

update_demand_supply()
