const fs = require('fs');

let file = fs.readFileSync('../Website_Admin/src/components/bde/BDELeadManagement.jsx', 'utf8');

if (!file.includes('const [tokenFollowUpDate, setTokenFollowUpDate]')) {
  file = file.replace(
    'const [isConfirmDateCalendarOpen, setIsConfirmDateCalendarOpen] = useState(false);',
    'const [isConfirmDateCalendarOpen, setIsConfirmDateCalendarOpen] = useState(false);\n  const [tokenFollowUpDate, setTokenFollowUpDate] = useState("");'
  );
  
  // Inject follow-up date UI in both modals
  const followUpUI = `
            {!isAU && (
              <div className="p-4 border-t border-b bg-amber-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Set Follow-up for Token Payment</h4>
                  <p className="text-[10px] text-slate-500">Only applicable for countries requiring tokens.</p>
                </div>
                <input 
                  type="date" 
                  value={tokenFollowUpDate}
                  onChange={e => setTokenFollowUpDate(e.target.value)}
                  className="text-xs font-bold border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
            )}
`;

  file = file.replace(
    '<div className="p-4 border-t bg-gray-50 flex justify-between items-center">',
    followUpUI + '\n            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">'
  );
  
  // Also second modal (there are 2 occurrences of the same line)
  // Let's just do a global replace for all occurrences of that line inside the modals.
  // Actually, string replace only replaces the first occurrence, so I'll do it twice.
  file = file.replace(
    '<div className="p-4 border-t bg-gray-50 flex justify-between items-center">',
    followUpUI + '\n            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">'
  );

  // Add payload injection
  file = file.replace(
    'payload.preferredDate = selectedRawDate;\n      } else {',
    'payload.preferredDate = selectedRawDate;\n      } else {\n        alert("Please select a date from the calendar.");\n        return;\n      }\n      if (tokenFollowUpDate) payload.nextFollowUp = tokenFollowUpDate;'
  );
  
  // Clean up duplicate alert in replace above:
  file = file.replace('alert("Please select a date from the calendar.");\n        return;\n      }\n      if (tokenFollowUpDate) payload.nextFollowUp = tokenFollowUpDate;\n        alert("Please select a date from the calendar.");\n        return;\n      }', 'alert("Please select a date from the calendar.");\n        return;\n      }\n      if (tokenFollowUpDate) payload.nextFollowUp = tokenFollowUpDate;');

  fs.writeFileSync('../Website_Admin/src/components/bde/BDELeadManagement.jsx', file);
  console.log("Patched tokenFollowUpDate");
}
