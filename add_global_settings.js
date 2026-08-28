const fs = require('fs');
let text = fs.readFileSync('Website_Admin/src/components/OrderJourneyScreen.jsx', 'utf-8');

const newHtml = `      </div>

      {/* Global Overdue Settings */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Global Overdue Settings</h2>
            <p className="text-xs text-slate-500">Configure maximum allowed days before escalating to overdue status.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <label className="block text-sm font-bold text-slate-700 mb-1">Installation Date Selection Overdue</label>
            <p className="text-[10px] text-slate-500 mb-3">Days allowed for customer to select install date before showing cancellation popup.</p>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                min="1" 
                max="30"
                value={settings.installDateSelectionSlaDays || 3}
                onChange={(e) => setSettings({...settings, installDateSelectionSlaDays: parseInt(e.target.value) || 3})}
                className="w-24 text-center font-bold text-slate-800 border-2 border-slate-300 rounded-lg py-1.5 focus:border-red-500 focus:outline-none" 
              />
              <span className="text-sm font-bold text-slate-600">Days</span>
            </div>
          </div>
        </div>
      </div>`;

const idx = text.indexOf('{toast && (');
text = text.slice(0, idx) + newHtml + '\n\n      ' + text.slice(idx);

fs.writeFileSync('Website_Admin/src/components/OrderJourneyScreen.jsx', text);
