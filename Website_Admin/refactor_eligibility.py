import re

def update_eligibility():
    with open('D:/sunnovative-australia-website/Website_Admin/src/components/CustomerEligibilityScreen.jsx', 'r') as f:
        content = f.read()

    # 1. Rename to CustomerEligibilityContent
    content = content.replace('export const CustomerEligibilityScreen = ({ section = null }) => {', 'export const CustomerEligibilityContent = ({ section = null, selectedCountryObj, onBack }) => {\n  const selectedCountry = selectedCountryObj.code;\n  const selectedCountryName = selectedCountryObj.name;\n')

    # 2. Add the new wrapper at the top
    wrapper = """
export const CustomerEligibilityScreen = ({ section = null }) => {
  const [countries, setCountries] = React.useState([]);
  const [selectedCountryObj, setSelectedCountryObj] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Customer Eligibility Settings</h1>
          <p className="text-slate-500">Select a country to configure its eligibility rules and subsidies.</p>
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

  return <CustomerEligibilityContent section={section} selectedCountryObj={selectedCountryObj} onBack={() => setSelectedCountryObj(null)} />;
};

"""
    # Insert after `export const CustomerEligibilityScreen = ...` replacement above? No, I need to insert `wrapper` before `export const CustomerEligibilityContent`
    
    # Let's just prepend `wrapper` right before the `export const CustomerEligibilityContent`
    content = content.replace('export const CustomerEligibilityContent = ({ section = null, selectedCountryObj, onBack }) => {', wrapper + '\nexport const CustomerEligibilityContent = ({ section = null, selectedCountryObj, onBack }) => {')

    # 3. Add back button
    content = content.replace('<div className="flex justify-between items-end mb-8 relative z-10">', '<div className="mb-6"><button onClick={onBack} className="text-sm text-blue-600 hover:underline flex items-center gap-1">← Back to Countries</button></div>\n      <div className="flex justify-between items-end mb-8 relative z-10">')

    # 4. Remove inline fetchCountries logic and state from CustomerEligibilityContent
    content = re.sub(r'const \[selectedCountry, setSelectedCountry\] = useState\("india"\);\s*const \[countries, setCountries\] = useState\(\[\]\);\s*useEffect\(\(\) => \{[^\}]+\}\(\);\s*\}, \[\]\);', '', content, flags=re.DOTALL)
    
    # 5. Remove the country selector dropdown from the UI
    country_dropdown_regex = re.compile(r'<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-4">.*?</div>', re.DOTALL)
    content = country_dropdown_regex.sub('', content)

    with open('D:/sunnovative-australia-website/Website_Admin/src/components/CustomerEligibilityScreen.jsx', 'w') as f:
        f.write(content)

update_eligibility()
