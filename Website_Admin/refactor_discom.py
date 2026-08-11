import re

def update_discoms():
    with open('D:/sunnovative-australia-website/Website_Admin/src/components/DiscomManagementScreen.jsx', 'r') as f:
        content = f.read()

    # 1. Rename to DiscomManagementContent
    content = content.replace('export const DiscomManagementScreen = () => {', 'export const DiscomManagementContent = ({ selectedCountryObj, onBack }) => {\n  const selectedCountry = selectedCountryObj.code;\n  const selectedCountryName = selectedCountryObj.name;\n')

    # 2. Add the new wrapper at the top
    wrapper = """
export const DiscomManagementScreen = () => {
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Discom Management</h1>
          <p className="text-slate-500">Select a country to manage its Distribution Companies.</p>
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

  return <DiscomManagementContent selectedCountryObj={selectedCountryObj} onBack={() => setSelectedCountryObj(null)} />;
};

"""
    content = content.replace('const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";', 'const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";\n' + wrapper)

    # 3. Add back button
    content = content.replace('<div className="mb-6">', '<div className="mb-6"><button onClick={onBack} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4">← Back to Countries</button>')

    # 4. Filter discoms by selectedCountry
    content = content.replace('const fetchDiscoms = async () => {', 'const fetchDiscoms = async () => {\n    if (!selectedCountry) return;')
    content = content.replace('const res = await fetch(`${API_BASE}/api/discoms`);', 'const res = await fetch(`${API_BASE}/api/discoms?country=${selectedCountry}`);')
    
    # Update default formData country
    content = content.replace('country: "",', 'country: selectedCountry,')
    content = content.replace('setFormData({ name: "", country: "", state: "", districts: "" });', 'setFormData({ name: "", country: selectedCountry, state: "", districts: "" });')

    # Disable country input in form or remove it since it's hardcoded to selectedCountry
    content = re.sub(
        r'<label.*?Country.*?</select>',
        '<input type="hidden" name="country" value={formData.country} />',
        content,
        flags=re.DOTALL
    )

    with open('D:/sunnovative-australia-website/Website_Admin/src/components/DiscomManagementScreen.jsx', 'w') as f:
        f.write(content)

update_discoms()
