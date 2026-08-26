const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace('{isFreelancer && (\n          <button \n            onClick={handleOpenAdd}', '{isFreelancer && filterTab !== "self-leads" && (\n          <button \n            onClick={handleOpenAdd}');

fs.writeFileSync(file, code);
