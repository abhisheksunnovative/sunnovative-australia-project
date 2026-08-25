const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDEDashboard.jsx', 'utf8');

const regex = /(\{\/\* PROJECT TYPES CARDS \(REPLACING ANY OLD METRICS \/ STC\) \*\/\}\r?\n\s*)(<div>\r?\n\s*<h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">\r?\n\s*<Zap className="w-5 h-5 text-yellow-500" \/> Commission Per Lead[\s\S]*?)(<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 mt-6">)/;

if (regex.test(c) && !c.includes('{isFreelancer && (')) {
  c = c.replace(regex, '$1{isFreelancer && (\n$2      )}\n\n      $3');
  fs.writeFileSync('src/components/bde/BDEDashboard.jsx', c);
  console.log("Successfully wrapped Commission section!");
} else {
  console.log("Regex didn't match or already wrapped.");
}
