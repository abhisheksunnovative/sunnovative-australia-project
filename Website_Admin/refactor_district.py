import re

with open('D:/sunnovative-australia-website/Website_Admin/src/components/DistrictPincodeSettings.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const [loading, setLoading] = useState(false);',
    'const [loading, setLoading] = useState(false);\n  const [showAddForm, setShowAddForm] = useState(false);'
)

content = content.replace(
    'setFormData({ state: "", district: "", pincodes: "" });',
    'setFormData({ state: "", district: "", pincodes: "" });\n        setShowAddForm(false);'
)

div_start = '<div style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "5px" }}>'
replacement_div = '''
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 style={{ color: "#28377f", margin: 0 }}>Districts</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              backgroundColor: "#28377f",
              color: "white",
              border: "none",
              padding: "8px 16px",
              cursor: "pointer",
              borderRadius: "4px",
              fontWeight: "bold"
            }}
          >
            + Add District
          </button>
        )}
      </div>

      {showAddForm && (
        <div style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "5px", position: "relative" }}>
          <button 
            type="button"
            onClick={() => setShowAddForm(false)}
            style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
          >
            ?
          </button>
'''
content = content.replace(div_start, replacement_div)

form_end = '</form>\n      </div>'
replacement_form_end = '</form>\n        </div>\n      )}'
content = content.replace(form_end, replacement_form_end)

content = content.replace('<h3 style={{ color: "#28377f" }}>Districts</h3>\n      {loading', '{loading')

with open('D:/sunnovative-australia-website/Website_Admin/src/components/DistrictPincodeSettings.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated DistrictPincodeSettings.jsx')
