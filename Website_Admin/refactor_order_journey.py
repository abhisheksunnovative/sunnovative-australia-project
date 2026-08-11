with open('D:/sunnovative-australia-website/Website_Admin/src/components/OrderJourneyScreen.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'export const OrderJourneyScreen = ({ selectedCountry: propCountry }) => {',
    'export const OrderJourneyScreen = ({ selectedCountry: propCountry, readOnly = false }) => {'
)

# Hide Reset and Save buttons if readOnly
header_buttons = '''
          <div className="flex items-center gap-3">
            {!readOnly && (
              <>
                <button onClick={handleReset} disabled={resetting} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition disabled:opacity-50">
                  {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Reset
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-900 bg-yellow-400 rounded-xl hover:bg-amber-400 transition shadow-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </>
            )}
            {readOnly && (
              <span className="px-3 py-1 bg-slate-100 text-slate-600 font-semibold text-sm rounded-lg border border-slate-200">
                View Only
              </span>
            )}
          </div>
'''
content = content.replace('''
          <div className="flex items-center gap-3">
            <button onClick={handleReset} disabled={resetting} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition disabled:opacity-50">
              {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Reset
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-900 bg-yellow-400 rounded-xl hover:bg-amber-400 transition shadow-sm disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
'''.strip(), header_buttons.strip())

# Hide "Add New Step"
add_step = '''
            {!readOnly && (
              <button
                onClick={() => {
                  const newJourney = { ...journey };
                  newJourney.steps.push({ ...STEP_TEMPLATE });
                  onUpdateJourney(journeyIndex, "steps", newJourney.steps);
                }}
                className="mt-6 flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors bg-white hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" /> Add New Step
              </button>
            )}
'''
content = content.replace('''
            <button
              onClick={() => {
                const newJourney = { ...journey };
                newJourney.steps.push({ ...STEP_TEMPLATE });
                onUpdateJourney(journeyIndex, "steps", newJourney.steps);
              }}
              className="mt-6 flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors bg-white hover:bg-slate-50"
            >
              <Plus className="w-4 h-4" /> Add New Step
            </button>
'''.strip(), add_step.strip())

# Hide "Add Journey" button for readOnly
add_journey = '''
          {!readOnly && (
            <div className="flex gap-4">
              <select
                value={newProjectType}
                onChange={e => setNewProjectType(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">-- Select Project Type --</option>
                {AVAILABLE_PROJECT_TYPES.map(pt => (
                  <option key={pt.id} value={pt.id} disabled={settings.projectTypes.some(p => p.projectType === pt.id)}>
                    {pt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddJourney}
                disabled={!newProjectType}
                className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Add Journey
              </button>
            </div>
          )}
'''
content = content.replace('''
          <div className="flex gap-4">
            <select
              value={newProjectType}
              onChange={e => setNewProjectType(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">-- Select Project Type --</option>
              {AVAILABLE_PROJECT_TYPES.map(pt => (
                <option key={pt.id} value={pt.id} disabled={settings.projectTypes.some(p => p.projectType === pt.id)}>
                  {pt.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddJourney}
              disabled={!newProjectType}
              className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Add Journey
            </button>
          </div>
'''.strip(), add_journey.strip())

with open('D:/sunnovative-australia-website/Website_Admin/src/components/OrderJourneyScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated OrderJourneyScreen.jsx')
