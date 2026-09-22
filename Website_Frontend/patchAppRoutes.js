import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// Add import
const importStr = "const ScanInsightDashboard = lazy(() => import(\"./components/ScanInsightDashboard\"));\n";
content = content.replace(
    "const CustomerLogin = lazy(() => import(\"./customer/CustomerLogin\"));",
    "const CustomerLogin = lazy(() => import(\"./customer/CustomerLogin\"));\n" + importStr
);

// Add Route
const routeStr = "        {/* Admin Pages */}\n        <Route path=\"/admin/insights\" element={<Suspense fallback={<div>Loading Insights...</div>}><ScanInsightDashboard /></Suspense>} />\n";
content = content.replace(
    "        {/* Standalone pages */}",
    routeStr + "        {/* Standalone pages */}"
);

fs.writeFileSync('src/App.jsx', content);
console.log("App.jsx updated with Admin route.");
