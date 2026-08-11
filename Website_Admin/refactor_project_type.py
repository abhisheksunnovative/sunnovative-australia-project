with open('D:/sunnovative-australia-website/Website_Admin/src/components/ProjectTypeSettings.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const ProjectTypeSettings = ({ selectedCountry }) => {',
    'const ProjectTypeSettings = ({ selectedCountry, readOnly = false }) => {'
)

save_btn_target = '''
      <button 
        onClick={handleSave} 
        disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save All Changes'}
      </button>
'''
save_btn_replace = '''
      {!readOnly && (
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      )}
      {readOnly && (
        <span className="bg-slate-100 text-slate-500 font-bold px-4 py-2 rounded-lg text-sm border border-slate-200">
          View Only
        </span>
      )}
'''
content = content.replace(save_btn_target.strip(), save_btn_replace.strip())

add_btn_target = '''
        <button 
          onClick={() => {
            setEditingType(null);
            setFormData({ projectType: '', projectTypeLabel: '', availableKw: '' });
            setShowForm(true);
          }}
          className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Type
        </button>
'''
add_btn_replace = '''
        {!readOnly && (
          <button 
            onClick={() => {
              setEditingType(null);
              setFormData({ projectType: '', projectTypeLabel: '', availableKw: '' });
              setShowForm(true);
            }}
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Type
          </button>
        )}
'''
content = content.replace(add_btn_target.strip(), add_btn_replace.strip())

edit_btn_target = '''
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setEditingType(pt._id);
                  setFormData({
                    projectType: pt.projectType,
                    projectTypeLabel: pt.projectTypeLabel,
                    availableKw: pt.availableKw.join(', ')
                  });
                  setShowForm(true);
                }}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(pt._id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
'''
edit_btn_replace = '''
            {!readOnly && (
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingType(pt._id);
                    setFormData({
                      projectType: pt.projectType,
                      projectTypeLabel: pt.projectTypeLabel,
                      availableKw: pt.availableKw.join(', ')
                    });
                    setShowForm(true);
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(pt._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
'''
content = content.replace(edit_btn_target.strip(), edit_btn_replace.strip())

# Disable toggles
toggle_target = '''
                <button 
                  onClick={() => handleToggle(pt._id, pt.isActive)}
                  className={elative inline-flex h-5 w-9 items-center rounded-full transition-colors }
                >
                  <span className={inline-block h-3 w-3 transform rounded-full bg-white transition-transform } />
                </button>
'''
toggle_replace = '''
                <button 
                  onClick={() => { if (!readOnly) handleToggle(pt._id, pt.isActive); }}
                  className={elative inline-flex h-5 w-9 items-center rounded-full transition-colors  }
                  disabled={readOnly}
                >
                  <span className={inline-block h-3 w-3 transform rounded-full bg-white transition-transform } />
                </button>
'''
content = content.replace(toggle_target.strip(), toggle_replace.strip())

with open('D:/sunnovative-australia-website/Website_Admin/src/components/ProjectTypeSettings.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated ProjectTypeSettings.jsx')
