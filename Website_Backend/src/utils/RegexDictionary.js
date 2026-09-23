export const AU_RETAILERS = [
  { id: 'ActewAGL',          pattern: /ActewAGL/i },
  { id: 'EnergyAustralia',   pattern: /Energy\s*Australia/i },
  { id: 'Aurora Energy',     pattern: /Aurora\s*Energy/i },
  { id: 'Ergon Energy',      pattern: /Ergon\s*Energy/i },
  { id: 'SA Power Networks', pattern: /SA\s*Power\s*Networks?/i },
  { id: 'Endeavour Energy',  pattern: /Endeavour\s*Energy/i },
  { id: 'Essential Energy',  pattern: /Essential\s*Energy/i },
  { id: 'AusNet Services',   pattern: /AusNet\s*(?:Services)?/i },
  { id: 'Momentum Energy',   pattern: /Momentum\s*Energy/i },
  { id: 'Simply Energy',     pattern: /Simply\s*Energy/i },
  { id: 'Alinta Energy',     pattern: /Alinta\s*Energy/i },
  { id: 'Horizon Power',     pattern: /Horizon\s*Power/i },
  { id: 'Lumo Energy',       pattern: /Lumo\s*Energy/i },
  { id: 'Red Energy',        pattern: /Red\s*Energy/i },
  { id: 'Origin Energy',     pattern: /\bOrigin\b/i },
  { id: 'AGL',               pattern: /\bAGL\b|AGL\s*Energy/i },
  { id: 'Synergy',           pattern: /\bSynergy\b/i },
  { id: 'Powercor',          pattern: /Powercor/i },
  { id: 'CitiPower',         pattern: /CitiPower/i },
  { id: 'Jemena',            pattern: /Jemena/i },
  { id: 'Ausgrid',           pattern: /Ausgrid/i },
  { id: 'Energex',           pattern: /Energex/i },
  { id: 'Evoenergy',         pattern: /Evoenergy/i },
];

export const AU_DICT = {
  accountNumber: "(?:Account\\s+(?:Number|No\\.?|#)|Account\\s*:)[\\s:]*([A-Z0-9][A-Z0-9\\- ]{4,18}[A-Z0-9])",
  tariffCategory: "(?:Your\\s*tariff\\s*:\\s*|Tariff(?:\\s*:|\\s*-)?\\s+|Current\\s*Account\\s*Charges\\s*\\n\\s*)([A-Za-z0-9\\/\\- ]+?)(?=\\s+Period\\b|\\n|\\r|$)",
  
  billNumber: "(?:Invoice\\s*(?:No\\.?|Number)?|Bill\\s*(?:No\\.?|Number)?|Tax\\s*Invoice\\s*(?:No\\.?|Number)?)\\s*[:\\-]?\\s*([A-Za-z0-9\\-]+)",
  billIssueDate: "(?:Issue\\s*Date|Date\\s*of\\s*Issue|Invoice\\s*Date|Bill\\s*Date|Statement\\s*Date)\\s*[:\\-]?\\s*([\\d]{1,2}\\s+[A-Za-z]{3,9}\\s+\\d{2,4}|[\\d]{1,2}[-/][\\d]{1,2}[-/][\\d]{2,4})",
  dueDate: "(?:Due\\s*Date|Payable\\s*by|Due\\s*by)\\^?\\s*:?\\s*([\\d]{1,2}\\s+[A-Za-z]{3,9}\\s+\\d{2,4})",
  
  amountPatterns: [
    "(?:Total\\s*Amount\\s*(?:Due|Payable|Outstanding)|Amount\\s*(?:Due|Payable)|Balance\\s*Due|Please\\s*Pay|Total\\s*balance)\\s*[:\\-]?\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)",
    "(?:Total\\s*(?:Current\\s*)?Bill|Bill\\s*Total)\\s*[:\\-]?\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)",
    "\\$\\s*([\\d,]+\\.\\d{2})\\s*(?:is\\s*due|payable|due\\s*by)",
    "(?:TOTAL\\s*DUE|Total\\s*due)[\\s\\S]{0,200}?\\$\\s*([\\d,]+(?:\\.\\d{2})?)",
    "(?:Total\\s*Amount\\s*Due|Amount\\s*Due|Please\\s*Pay)[\\s\\S]{0,150}?\\$\\s*([\\d,]+(?:\\.\\d{2})?)",
    "(?:TOTAL\\s*CHARGES|Total\\s*\\(\$\\)\\s*amount\\s*due)\\s*[:\\-]?\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)"
  ],
  
  usagePatterns: [
    "This\\s*bill\\s*[:\\-]?\\s*([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|units)",
    "(?:Energy\\s*Use|Energy\\s*Usage|electricity\\s*you\\s*used|Total\\s*electricity\\s*used)\\s*([\\d,]+(?:\\.\\d+)?)",
    "Equals\\s*total\\s*units\\s*used\\s*.*\\n.*\\s+([\\d,]+(?:\\.\\d+)?)",
    "(?:Total\\s*)?(?:Electricity\\s*)?(?:Usage|Used|Consumption|kWh\\s*Used|Units\\s*Used)[\\s\\S]{0,200}?([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|kW|units)",
    "([\\d,]+(?:\\.\\d+)?)\\s*kWh\\s*(?:used|consumed|usage|total)",
    "Total\\s*Consumption\\s*Charges\\s*[\\s\\S]{0,200}?([\\d,]+(?:\\.\\d+)?)\\s*kWh"
  ],

  namePatterns: [
    "(?:[Cc]ustomer|[Aa]ccount\\s*[Hh]older|[Aa]ccount\\s*[Nn]ame)\\s*[:\\-]?\\s*([A-Z][A-Za-z]+\\s+[A-Z][A-Za-z]+(?:\\s+[A-Z][A-Za-z]+)?)",
    "Dear\\s+(?:Mr\\.?\\s*|Ms\\.?\\s*|Mrs\\.?\\s*)?([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){0,3}),?"
  ]
};
