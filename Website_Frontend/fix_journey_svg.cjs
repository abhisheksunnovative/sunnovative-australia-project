const fs = require('fs');
const path = 'src/components/OrderJourneySteps.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldIconLogic = `const getIconForStep = (title) => {
  const t = title.toLowerCase();
  if (t.includes("bill") || t.includes("electricity")) {
    return <img src="/assets/journey/bill.jpg" alt="Electricity Bill" className="w-full h-full object-cover rounded-3xl" />;
  }
  if (t.includes("capacity") || t.includes("size") || t.includes("recommend")) {
    return <img src="/assets/journey/capacity.jpg" alt="Solar Capacity" className="w-full h-full object-cover rounded-3xl" />;
  }
  if (t.includes("eligibility") || t.includes("subsidy")) {
    return <img src="/assets/journey/subsidy.jpg" alt="Subsidy Eligibility" className="w-full h-full object-cover rounded-3xl" />;
  }
  if (t.includes("property") || t.includes("occupancy")) {
    return <img src="/assets/journey/property.jpg" alt="Property Details" className="w-full h-full object-cover rounded-3xl" />;
  }
  if (t.includes("verify") || t.includes("document") || t.includes("approve")) {
    return <img src="/assets/journey/verify.jpg" alt="Verify Documents" className="w-full h-full object-cover rounded-3xl" />;
  }
  if (t.includes("date") || t.includes("schedule") || t.includes("calendar") || t.includes("slot")) {
    return <img src="/assets/journey/calendar.jpg" alt="Installation Date" className="w-full h-full object-cover rounded-3xl" />;
  }
  if (t.includes("install") || t.includes("construct") || t.includes("commission")) {
    return <img src="/assets/journey/house.jpg" alt="Solar Installation" className="w-full h-full object-cover rounded-3xl" />;
  }
  // Default fallback
  return <img src="/assets/journey/capacity.jpg" alt="Solar Step" className="w-full h-full object-cover rounded-3xl" />;
};`;

const newIconLogic = `const getIconForStep = (title) => {
  const t = title.toLowerCase();
  const iconProps = { className: "w-10 h-10 text-solar-yellow transition-transform duration-300 group-hover:scale-110" };
  
  if (t.includes("bill") || t.includes("electricity")) return <Receipt {...iconProps} />;
  if (t.includes("capacity") || t.includes("size") || t.includes("recommend")) return <Sun {...iconProps} />;
  if (t.includes("eligibility") || t.includes("subsidy")) return <CheckCircle {...iconProps} />;
  if (t.includes("property") || t.includes("occupancy")) return <FileText {...iconProps} />;
  if (t.includes("verify") || t.includes("document") || t.includes("approve")) return <ClipboardList {...iconProps} />;
  if (t.includes("date") || t.includes("schedule") || t.includes("calendar") || t.includes("slot")) return <CalendarCheck {...iconProps} />;
  if (t.includes("install") || t.includes("construct") || t.includes("commission")) return <Hammer {...iconProps} />;
  
  return <Zap {...iconProps} />;
};`;

// replace icon container and tag
const oldContainer = `<div className="w-24 h-24 rounded-3xl bg-white shadow-lg border border-slate-100 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 relative">
                {item.icon}

                {/* Micro timing tag */}
                <div className="absolute -bottom-2 px-1.5 py-0.5 bg-orange-600 text-[9px] text-white font-semibold rounded shadow whitespace-nowrap">
                  {item.badge}
                </div>
              </div>`;

const newContainer = `<div className="w-20 h-20 rounded-2xl bg-solar-navy shadow-lg border border-slate-800 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:-translate-y-1 relative">
                {item.icon}

                {/* Micro timing tag */}
                <div className="absolute -bottom-2 px-2 py-0.5 bg-solar-green text-[10px] text-solar-navy font-bold rounded shadow whitespace-nowrap border border-solar-navy">
                  {item.badge}
                </div>
              </div>`;

if(content.includes(oldIconLogic)) {
    content = content.replace(oldIconLogic, newIconLogic);
    content = content.split(oldContainer).join(newContainer);
    fs.writeFileSync(path, content);
    console.log("Successfully replaced OrderJourneySteps with EmergeSun Brand SVG Icons.");
} else {
    console.log("Could not find block in OrderJourneySteps.");
}
