const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src', 'components');

const replacements = {
  'User ka monthly bill jis range mein aata hai, ussi hisaab se auto-suggest kW milega. Ye ranges admin set karta hai.': "The auto-suggested kW is determined by the user's monthly bill range. These ranges are configured by the admin.",
  'Har state ka 1kW, 2kW, 3kW ke liye total subsidy (Central + State) dikh raha hai.': 'Displays the total subsidy (Central + State) for 1kW, 2kW, and 3kW per state.',
  'Central subsidy formula-based hai:': 'Central subsidy is formula-based:',
  'Ye list seedha <strong>Project Configuration</strong> se live fetch ho rahi hai': 'This list is fetched live from <strong>Project Configuration</strong>',
  'Naye categories wahi add/edit karein.': 'Add or edit new categories there.',
  'Koi Project Category nahi mili.': 'No Project Categories found.',
  'System se zyada suggest nahi karega': 'System will not suggest beyond this limit',
  'Yahan par manual editing disable kar di gayi hai taaki system me koi data conflict na ho.': 'Manual editing is disabled here to prevent data conflicts in the system.',
  'Hard block — application submit nahi hogi': 'Hard block — prevents application submission',
  'Soft warning — apply kar sakta hai phir bhi': 'Soft warning — allows application submission with a warning',
  'Har project type ke liye hero header, FAQs, footer, aur customer journey flowchart customizable hai.': 'The hero header, FAQs, footer, and customer journey flowchart are customizable for each project type.',
  'Order Journey se match nahi ho raha!': 'does not match the Order Journey!',
  'Boss yahan se configure karta hai:': 'Admin configurations:',
  'KW credit pricing, free trial, aur recharge packages configure karo': 'Configure kW credit pricing, free trials, and recharge packages',
  'Backend connect nahi hua — default settings dikh rahi hain. Save karne pe store ho jayega.': 'Backend not connected — displaying default settings. Will be stored upon saving.',
  'EPC isse kam KW purchase nahi kar sakta': 'EPC cannot purchase less than this kW amount',
  'Jab balance low ho tab automatically minimum pack purchase karo (payment gateway integration needed)': 'Automatically purchase minimum pack when balance is low (payment gateway integration needed)',
  'Project types change karne ke liye backend mein PROJECT_TYPES array update karo': 'Update the PROJECT_TYPES array in the backend to change project types',
  'Name required hai': 'Name is required',
  'Lead create nahi hua': 'Failed to create lead',
  'File select karo': 'Please select a file',
  'Leads load nahi hue': 'Failed to load leads',
  'Koi lead nahi mila': 'No leads found',
  'Order load nahi hua': 'Failed to load order',
  'Step complete nahi hua': 'Failed to complete step',
  '(Kaun Kaun Step Execute Kar Sakta Hai)': '',
  'Customer portal se execute kar sakta hai': 'Can be executed from the customer portal',
  'EPC Installer execute kar sakta hai': 'Can be executed by the EPC Installer',
  'BDE customer ke behalf par execute kar sakta hai': 'Can be executed by BDE on behalf of the customer',
  'Could not load settings. Backend check karo.': 'Could not load settings. Please check the backend.',
  'Step complete hone pe auto next step pe move karo': 'Automatically move to the next step upon completion',
  'Customer name, mobile, ya order number search karo...': 'Search by customer name, mobile, or order number...',
  'Koi project order nahi mila': 'No project orders found',
  'ko karna hai': 'action required'
};

const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));
let totalReplaced = 0;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const [hinglish, english] of Object.entries(replacements)) {
    if (content.includes(hinglish)) {
      content = content.split(hinglish).join(english);
      changed = true;
      totalReplaced++;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', file);
  }
});

console.log('Total strings replaced:', totalReplaced);
