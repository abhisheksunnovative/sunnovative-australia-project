const fs = require('fs');
const file = 'src/components/bde/BDELayout.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldLogic = `          if (l.installDateBooked) {
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

const newLogic = `          if (l.installDateBooked) {
             prospectsCount++;
          } else if (!l.convertedProjectId) {
             if (l.isEligibleForInstallation) leadsCount++;
             else eligibilityCount++;
          }
        });
      }
      if (projRes && projRes.ok) {
        const p = await projRes.json();
        projCount = p.data?.length || p.projects?.length || 0;
      }
      setTabCounts({ leads: leadsCount, eligibility: eligibilityCount, projects: projCount, prospects: prospectsCount });`;

code = code.replace(oldLogic, newLogic);
code = code.replace('let leadsCount = 0;', 'let leadsCount = 0;\n      let eligibilityCount = 0;');

fs.writeFileSync(file, code);
console.log('Fixed loadCounts in BDELayout!');
