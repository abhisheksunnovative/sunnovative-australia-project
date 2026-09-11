const fs = require('fs');
const path = 'src/components/OrderJourneySteps.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `const getIconForStep = (title) => {
  const t = title.toLowerCase();
  if (t.includes("bill") || t.includes("electricity")) {
    return <img src="/assets/journey/bill.jpg" alt="Electricity Bill" className="w-full h-full object-cover rounded-3xl" />;
  }
  if (t.includes("capacity") || t.includes("size") || t.includes("recommend")) {
    return <img src="/assets/journey/capacity.jpg" alt="Solar Capacity" className="w-full h-full object-cover rounded-3xl" />;
  }
  if (t.includes("date") || t.includes("schedule") || t.includes("calendar")) {
    return <img src="/assets/journey/calendar.jpg" alt="Installation Date" className="w-full h-full object-cover rounded-3xl" />;
  }
  if (t.includes("install") || t.includes("construct")) {
    return <img src="/assets/journey/house.jpg" alt="Solar Installation" className="w-full h-full object-cover rounded-3xl" />;
  }
  // Default fallback
  return <img src="/assets/journey/capacity.jpg" alt="Solar Step" className="w-full h-full object-cover rounded-3xl" />;
};`;

const replacement = `const getIconForStep = (title) => {
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

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log("Successfully mapped new logos in OrderJourneySteps.");
} else {
    console.log("Target block not found. Checking...");
}
