with open('D:/sunnovative-australia-website/Website_Admin/src/components/ProductConfigSettings.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const ProductConfigSettings = ({ selectedCountry }) => {',
    'const ProductConfigSettings = ({ selectedCountry, readOnly = false }) => {'
)

dropdown_target = '''
<div className="mb-6">
<label className="block text-sm font-medium text-slate-700 mb-1">Select Project Type</label>
<select
className="w-full md:w-1/2 p-2 border border-slate-300 rounded focus:ring-[#f97316] focus:border-[#f97316]"
value={selectedProjectType}
onChange={(e) => setSelectedProjectType(e.target.value)}
>
<option value="">-- Select Project Type --</option>
{projectTypes.map(pt => (
<option key={pt._id || pt.key || pt.projectType} value={pt.key || pt.projectType}>
{pt.label || pt.projectTypeLabel || pt.projectType}
</option>
))}
</select>
</div>
'''

cards_replace = '''
<div className="mb-6">
  <label className="block text-sm font-medium text-slate-700 mb-3">Select Project Type</label>
  <div className="flex flex-wrap gap-3">
    {projectTypes.map(pt => {
      const ptValue = pt.key || pt.projectType;
      const isSelected = selectedProjectType === ptValue;
      return (
        <button
          key={pt._id || ptValue}
          onClick={() => setSelectedProjectType(ptValue)}
          className={px-4 py-3 border rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center min-w-[140px] }
        >
          {pt.label || pt.projectTypeLabel || pt.projectType}
        </button>
      );
    })}
    {projectTypes.length === 0 && (
      <div className="text-slate-500 text-sm italic">No project types found for this country.</div>
    )}
  </div>
</div>
'''
# Account for pt.label vs pt.projectType variations in existing file
import re
dropdown_pattern = re.compile(r'<div className="mb-6">\s*<label.*?Select Project Type.*?</select>\s*</div>', re.DOTALL)
content = dropdown_pattern.sub(cards_replace.strip(), content)

# Wrap "Add New Product" in !readOnly
add_form_target = r'(<h3 className="text-lg font-medium text-slate-800 mb-3">Add New Product</h3>\s*<form.*?)(<h3 className="text-lg font-medium text-slate-800 mb-3 mt-8">)'
add_form_replace = r'{!readOnly && (\n<div className="mb-8 border-b pb-8">\n\1</div>\n)}\n\2'
content = re.sub(add_form_target, add_form_replace, content, flags=re.DOTALL)

# Wrap delete button in !readOnly
del_btn_target = r'(<button\s*onClick={\(\) => handleDeleteProduct\(config._id\)}\s*className="text-red-500 hover:text-red-700"\s*title="Delete Product"\s*>\s*<svg.*?</svg>\s*</button>)'
del_btn_replace = r'{!readOnly && \1}'
content = re.sub(del_btn_target, del_btn_replace, content, flags=re.DOTALL)

with open('D:/sunnovative-australia-website/Website_Admin/src/components/ProductConfigSettings.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated ProductConfigSettings.jsx')
