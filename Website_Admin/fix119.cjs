const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const importQueue = `import NeedsTemplateReviewQueue from './NeedsTemplateReviewQueue';\n`;
if (!code.includes("import NeedsTemplateReviewQueue")) {
    code = code.replace(
        "import { fetchWithCache } from '../utils/fetchWithCache';",
        "import { fetchWithCache } from '../utils/fetchWithCache';\n" + importQueue
    );
}

// Add state for active tab
if (!code.includes('const [activeTab, setActiveTab]')) {
    code = code.replace(
        'const [editingTemplate, setEditingTemplate] = useState(null);',
        'const [editingTemplate, setEditingTemplate] = useState(null);\n  const [activeTab, setActiveTab] = useState("templates");'
    );
}

// Ensure sourceScanAnalyticsId is captured in state
if (!code.includes('sourceScanAnalyticsId: null')) {
    code = code.replace(
        'extractionRules: []',
        'extractionRules: [],\n    sourceScanAnalyticsId: null'
    );
}

// Add onBuildTemplate handler
const onBuildTemplateHandler = `
  const handleBuildFromQueue = (analyticsItem) => {
    setEditingTemplate(null);
    setFormData({
      discomName: '',
      country: analyticsItem.country,
      isActive: true,
      status: 'approved',
      anchorKeywords: '',
      extractionRules: [],
      sourceScanAnalyticsId: analyticsItem._id
    });
    setRawTextPreview(analyticsItem.rawText || '');
    setIsModalOpen(true);
  };
`;
if (!code.includes('handleBuildFromQueue')) {
    code = code.replace('useEffect(() => {', onBuildTemplateHandler + '\n  useEffect(() => {');
}

// Render tabs UI where "DISCOM / TEMPLATES LIST" is returned
const targetRender = `        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => { setSelectedState(null); setDiscoms([]); setTemplates([]); }} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100"><ArrowLeft className="w-5 h-5" /></button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{selectedCountry} > {selectedState} > Discoms</h1>
                <p className="text-slate-500 text-sm mt-1">Manage zero-cost Regex templates for these Discoms</p>
              </div>
            </div>
            
          </div>
        </div>`;

const newRender = `        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => { setSelectedState(null); setDiscoms([]); setTemplates([]); }} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100"><ArrowLeft className="w-5 h-5" /></button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{selectedCountry} > {selectedState} > Discoms</h1>
                <p className="text-slate-500 text-sm mt-1">Manage zero-cost Regex templates for these Discoms</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-6 border-b border-slate-200">
             <button onClick={() => setActiveTab('templates')} className={\`pb-2 px-2 text-sm font-bold border-b-2 transition-colors \${activeTab === 'templates' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}>Templates List</button>
             <button onClick={() => setActiveTab('unmatched')} className={\`pb-2 px-2 text-sm font-bold border-b-2 transition-colors \${activeTab === 'unmatched' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}>📋 Unmatched Bills Queue</button>
          </div>
        </div>
        
        {activeTab === 'unmatched' ? (
           <NeedsTemplateReviewQueue country={selectedCountry.toLowerCase()} onBuildTemplate={handleBuildFromQueue} />
        ) : (
`;

code = code.replace(targetRender, newRender);

// Close the activeTab conditional
code = code.replace(
    /<\/div>\n\s*<Modal/g,
    '</div>\n        )}\n\n      <Modal'
);

fs.writeFileSync(path, code);
console.log("Injected NeedsTemplateReviewQueue into BillTemplateManagementScreen.");
