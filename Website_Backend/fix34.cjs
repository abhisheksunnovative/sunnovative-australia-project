const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Frontend/src/components/LeadForm.jsx';
let code = fs.readFileSync(path, 'utf8');

const oldHook = '  const [dueDate, setDueDate] = useState("");';
const newHook = '  const [dueDate, setDueDate] = useState("");\n  const [scanFallbackReason, setScanFallbackReason] = useState(null);\n  const [manualBillDate, setManualBillDate] = useState("");';

if (code.includes(oldHook)) {
  code = code.replace(oldHook, newHook);
} else if (code.includes(oldHook.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldHook.replace(/\n/g, '\r\n'), newHook.replace(/\n/g, '\r\n'));
}

const oldSet = 'setScannedBillingPeriod(null);';
const newSet = 'setScannedBillingPeriod(null);\n      setScanFallbackReason(null);\n      setManualBillDate("");';
if (code.includes(oldSet)) {
  code = code.replace(oldSet, newSet);
} else if (code.includes(oldSet.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldSet.replace(/\n/g, '\r\n'), newSet.replace(/\n/g, '\r\n'));
}

const oldUpdate = 'if (data.stcInfo) setScannedStcInfo(data.stcInfo);';
const newUpdate = 'if (data.stcInfo) setScannedStcInfo(data.stcInfo);\n          setScanFallbackReason(data.fallbackReason || null);';
if (code.includes(oldUpdate)) {
  code = code.replace(oldUpdate, newUpdate);
} else if (code.includes(oldUpdate.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldUpdate.replace(/\n/g, '\r\n'), newUpdate.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(path, code);
console.log('Hooks updated in LeadForm.jsx');
