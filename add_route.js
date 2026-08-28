const fs = require('fs');
let text = fs.readFileSync('Website_Backend/src/routes/customerRoutes.js', 'utf-8');

if (!text.includes('cancelOverdueProject')) {
    text = text.replace('import {', 'import {\n  cancelOverdueProject,');
    text = text.replace('router.get("/projects",', 'router.post("/projects/:id/cancel", customerAuth, cancelOverdueProject);\nrouter.get("/projects",');
    fs.writeFileSync('Website_Backend/src/routes/customerRoutes.js', text);
}
