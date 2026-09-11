const fs = require("fs");

function addImport(filepath) {
    let content = fs.readFileSync(filepath, "utf-8");
    const pattern = /(import \{[^}]+)(\}\s*from\s*['"`]lucide-react['"`];)/;
    
    if (content.match(pattern)) {
        if (!content.match(/import \{[^}]*\bUser\b[^}]*\}\s*from\s*['"`]lucide-react['"`]/)) {
            content = content.replace(pattern, "$1, User $2");
            fs.writeFileSync(filepath, content);
            console.log("Fixed", filepath);
        } else {
            console.log("Already has User in", filepath);
        }
    }
}

addImport("Website_Admin/src/components/bde/BDEProspects.jsx");
addImport("Website_Admin/src/components/bde/BDELeadManagement.jsx");
