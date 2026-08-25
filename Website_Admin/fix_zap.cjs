const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');

c = c.replace(
  `import { MapPin, PhoneCall, Calendar, ArrowRight, UserCheck, CheckCircle, Edit2, Plus, X, ShieldCheck, XCircle, Clock } from "lucide-react";`,
  `import { MapPin, PhoneCall, Calendar, ArrowRight, UserCheck, CheckCircle, Edit2, Plus, X, ShieldCheck, XCircle, Clock, Zap } from "lucide-react";`
);

fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', c);
console.log("Added Zap to imports!");
