const fs = require('fs');

function fixTrustSection() {
    const path = 'src/components/TrustSection.jsx';
    let content = fs.readFileSync(path, 'utf8');

    // 1. Fix default icons colors
    content = content.replace(/text-solar-sky/g, 'text-solar-navy');
    content = content.replace(/text-blue-500/g, 'text-solar-yellow');
    content = content.replace(/text-teal-600/g, 'text-solar-navy');
    content = content.replace(/text-amber-600/g, 'text-solar-yellow');
    content = content.replace(/text-solar-green/g, 'text-solar-navy');

    // 2. Fix alignment logic (remove md:col-span-2)
    // The class string is: className={`p-5 rounded-2xl glass-panel transition-all duration-300 ${ index === 3 ? "md:col-span-2" : "" }`}
    const oldClass = 'className={`p-5 rounded-2xl glass-panel transition-all duration-300 ${\\n                    index === 3 ? "md:col-span-2" : ""\\n                  }`';
    const newClass = 'className={`p-5 rounded-2xl glass-panel transition-all duration-300 flex flex-col`}';
    
    // Let's use regex for safer replacement of the class logic
    content = content.replace(/className=\{`p-5 rounded-2xl glass-panel transition-all duration-300 \$\{\s*index === 3 \? "md:col-span-2" : ""\s*\}\`\}/g, 
                             'className={`p-5 rounded-2xl glass-panel transition-all duration-300 flex flex-col items-start`}');

    fs.writeFileSync(path, content);
    console.log("TrustSection updated.");
}

function fixBenefitsSection() {
    const path = 'src/components/Benefits.jsx';
    let content = fs.readFileSync(path, 'utf8');

    // 1. Fix colors in Benefits
    content = content.replace(/text-amber-600/g, 'text-solar-yellow');
    content = content.replace(/text-sky-600/g, 'text-solar-navy');
    content = content.replace(/text-emerald-600/g, 'text-solar-green');
    content = content.replace(/text-indigo-600/g, 'text-solar-navy');
    content = content.replace(/text-rose-600/g, 'text-solar-yellow');
    
    // The user also wants them aligned well. In Benefits, idx === 2 has md:col-span-2 lg:col-span-1
    // That's usually fine for bento grids, but let's ensure it's not breaking. Actually that layout is fine.

    fs.writeFileSync(path, content);
    console.log("Benefits updated.");
}

try {
    fixTrustSection();
    fixBenefitsSection();
} catch (e) {
    console.error(e);
}
