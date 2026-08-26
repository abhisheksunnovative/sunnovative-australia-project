const fs = require('fs');
const file = 'src/components/bde/BDELayout.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `          if (l.installDateBooked) {
             prospectsCount++;
          } else if (!l.convertedProjectId) {
             leadsCount++;
          }
        });
      }
      if (projRes && projRes.ok) {
        const p = await projRes.json();
        projCount = p.data?.length || p.projects?.length || 0;
      }
      setTabCounts({ leads: leadsCount, projects: projCount, prospects: prospectsCount });`;

const newCode = `          if (l.installDateBooked) {
             prospectsCount++;
          } else if (!l.convertedProjectId) {
             if (l.isEligibleForInstallation !== true) {
                 eligibilityCount++;
             } else {
                 leadsCount++;
             }
          }
        });
      }
      if (projRes && projRes.ok) {
        const p = await projRes.json();
        projCount = p.data?.length || p.projects?.length || 0;
      }
      setTabCounts({ leads: leadsCount, eligibility: eligibilityCount, projects: projCount, prospects: prospectsCount });`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
console.log("Patched BDELayout counts");
