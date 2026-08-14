import { OrderJourneySettings } from "../models/OrderJourneySettings.js";
import { ProjectOrder } from "../models/ProjectModel.js";


// ── Default journey data ──────────────────────────────────────────────────────

const INDIA_RESIDENTIAL = {
  projectType: "residential",
  projectTypeLabel: "Residential Solar",
  enabled: true,
  description: "PM Surya Ghar Yojana ke liye standard residential rooftop solar installation journey",
  steps: [
    { id: "in_r1", stepNumber: 1, title: "Check Subsidy Eligibility", description: "Kya wifey ne RGPU/RGPR tariff hai? Bill scan karo, meter category check karo", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 1, isMandatory: true, completionCondition: "manual", actionLabel: "Check Eligibility", notifyCustomer: true, notifyEPC: false, notifyAdmin: false, requiredActions: [] },
    { id: "in_r2", stepNumber: 2, title: "Submit Electricity Bill", description: "Customer apna latest electricity bill upload kare. OCR auto-scan hoga.", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Electricity Bill", fileType: "pdf", required: true }], actionLabel: "Upload Bill", notifyCustomer: true, notifyEPC: false, notifyAdmin: true, notificationMedium: ["in-app"] },
    { id: "in_r3", stepNumber: 3, title: "Upload Property Details", description: "Roof ka photo, property ownership document upload karo", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Property Photo", fileType: "image", required: true }, { label: "Aadhaar", fileType: "image", required: true }, { label: "Ownership Proof", fileType: "pdf", required: true }], actionLabel: "Upload Details", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_r4", stepNumber: 4, title: "Verify Customer Eligibility", description: "Admin OCR result + documents check kare, eligibility confirm kare", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", actionLabel: "Verify Customer", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "in_r5", stepNumber: 5, title: "Verify Documents", description: "Admin uploaded documents verify kare — authenticity check", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", actionLabel: "Verify Docs", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "in_r6", stepNumber: 6, title: "Select Installation Date", description: "EPC ke available slots mein se date choose karo", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 2, isMandatory: true, completionCondition: "manual", actionLabel: "Select Date", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_r7", stepNumber: 7, title: "Make Payment", description: "Token/advance payment karo online", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 3, isMandatory: true, completionCondition: "manual", requiredActions: [{ label: "Payment Receipt", fileType: "image", required: true }], actionLabel: "Pay Now", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_r8", stepNumber: 8, title: "Allocate EPC Partner", description: "Admin nearest qualified EPC assign kare", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "EPC Assignment Letter", fileType: "pdf", required: true }], actionLabel: "Allocate EPC", notifyCustomer: false, notifyEPC: true, notifyAdmin: false },
    { id: "in_r9", stepNumber: 9, title: "Accept Project", description: "EPC project accept kare (24 hr window)", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 1, isMandatory: true, completionCondition: "manual", actionLabel: "Accept", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r10", stepNumber: 10, title: "Conduct Site Survey", description: "EPC site visit kare, roof condition, orientation check kare", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Survey Report", fileType: "pdf", required: true }, { label: "Roof Photos", fileType: "image", required: true }, { label: "Shade Analysis", fileType: "pdf", required: true }], actionLabel: "Upload Survey", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r11", stepNumber: 11, title: "Submit Proposal", description: "EPC detailed proposal submit kare with pricing", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Proposal PDF", fileType: "pdf", required: true }, { label: "System Design", fileType: "pdf", required: true }, { label: "BOQ", fileType: "pdf", required: true }], actionLabel: "Submit Proposal", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r12", stepNumber: 12, title: "Install Solar System", description: "EPC actual installation kare (1-2 days typically)", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 7, isMandatory: true, completionCondition: "manual", actionLabel: "Mark Installed", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r13", stepNumber: 13, title: "Upload Installation Documents", description: "Photos: Front, Back, Meter, Inverter + compliance docs", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "4 Installation Photos", fileType: "image", required: true }, { label: "EPC Sign-off Form", fileType: "pdf", required: true }, { label: "Wiring Diagram", fileType: "image", required: true }], actionLabel: "Upload Proofs", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r14", stepNumber: 14, title: "Complete Net Meter Process", description: "DISCOM pe net meter application file karo, inspection schedule karo", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 7, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "DISCOM Application Form", fileType: "pdf", required: true }, { label: "Net Meter Photo", fileType: "image", required: true }, { label: "Inspection Report", fileType: "pdf", required: true }], actionLabel: "Complete Net Meter", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_r15", stepNumber: 15, title: "Process Subsidy Application", description: "Admin MNRE portal pe subsidy apply kare", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Subsidy Form", fileType: "pdf", required: true }, { label: "Bank Account Proof", fileType: "image", required: true }, { label: "MNRE Screenshot", fileType: "image", required: true }], actionLabel: "Process Subsidy", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "in_r16", stepNumber: 16, title: "Monitor Project Progress", description: "Admin internal QC review", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, completionCondition: "manual", actionLabel: "Review Progress", notifyCustomer: false, notifyEPC: false, notifyAdmin: false },
    { id: "in_r17", stepNumber: 17, title: "Close Project", description: "Final project closure, warranty activation", assignedTo: "epc-partner", allowedRoles: ["epc-partner", "company"], enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Completion Certificate", fileType: "pdf", required: true }], actionLabel: "Close", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
  ],
};

const INDIA_COMMERCIAL = {
  projectType: "commercial",
  projectTypeLabel: "Commercial Solar",
  enabled: true,
  description: "Industrial & commercial rooftop solar — same base steps as residential with additional CEIG/HT connection steps",
  steps: [
    { id: "in_c1", stepNumber: 1, title: "Commercial Enquiry + Load Analysis", description: "Company ka annual consumption analyze karo, 3-phase check karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "12 Months Bills", fileType: "pdf", required: true }, { label: "Load Profile", fileType: "pdf", required: true }, { label: "Single Line Diagram", fileType: "pdf", required: true }], actionLabel: "Complete Audit", notifyCustomer: false, notifyEPC: false, notifyAdmin: true },
    { id: "in_c2", stepNumber: 2, title: "Site Audit", description: "Company ka rooftop audit kare — load bearing, orientation, shadow", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 3, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "Audit Report", fileType: "pdf", required: true }, { label: "Shade Analysis", fileType: "pdf", required: true }, { label: "Structural Check", fileType: "pdf", required: true }], actionLabel: "Submit Audit", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_c3", stepNumber: 3, title: "Proposal + BOQ", description: "Detailed quote with material breakdown send karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Detailed Proposal PDF", fileType: "pdf", required: true }, { label: "BOQ", fileType: "pdf", required: true }, { label: "Pricing Sheet", fileType: "pdf", required: true }], actionLabel: "Send Proposal", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "in_c4", stepNumber: 4, title: "PO + Agreement Sign", description: "Customer Purchase Order sign kare, agreement execute karo", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Signed PO", fileType: "pdf", required: true }, { label: "Agreement Copy", fileType: "pdf", required: true }, { label: "GST Details", fileType: "pdf", required: true }], actionLabel: "Sign Agreement", notifyCustomer: false, notifyEPC: false, notifyAdmin: true },
    { id: "in_c5", stepNumber: 5, title: "EPC Bidding (if >10kW)", description: "Multiple EPCs ko bid invite karo, customer ke liye best match", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 7, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "Bid Documents", fileType: "pdf", required: true }, { label: "Comparative Sheet", fileType: "pdf", required: true }], actionLabel: "Complete Bidding", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_c6", stepNumber: 6, title: "EPC Selection + Assignment", description: "Customer best EPC choose kare cost + rating basis pe", assignedTo: "customer", allowedRoles: ["customer"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Selection Confirmation Letter", fileType: "pdf", required: true }], actionLabel: "Assign EPC", notifyCustomer: false, notifyEPC: true, notifyAdmin: true },
    { id: "in_c7", stepNumber: 7, title: "Advance Payment", description: "30-50% advance payment karo", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Advance Payment Receipt", fileType: "image", required: true }], actionLabel: "Pay Advance", notifyCustomer: false, notifyEPC: false, notifyAdmin: true },
    { id: "in_c8", stepNumber: 8, title: "Material Procurement", description: "Panels, inverters, structure material order karo", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 14, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Purchase Orders to Vendors", fileType: "pdf", required: true }, { label: "Delivery Challan", fileType: "pdf", required: true }], actionLabel: "Procure Material", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_c9", stepNumber: 9, title: "Civil + Structural Work", description: "Mounting structure, cable tray, conduit work", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 5, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Civil Completion Photos", fileType: "image", required: true }, { label: "Mounting Structure Checklist", fileType: "pdf", required: true }], actionLabel: "Complete Civil Work", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_c10", stepNumber: 10, title: "Electrical Installation", description: "Panels, inverters, DC wiring, AC wiring, earthing", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 7, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Wiring Diagram", fileType: "pdf", required: true }, { label: "Installation Photos", fileType: "image", required: true }], actionLabel: "Complete Install", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_c11", stepNumber: 11, title: "HT/LT Grid Connection", description: "Utility ke saath interconnection agreement execute karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 7, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "Interconnection Agreement", fileType: "pdf", required: true }, { label: "Grid Test Report", fileType: "pdf", required: true }], actionLabel: "Grid Connect", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_c12", stepNumber: 12, title: "Commissioning + Testing", description: "System test, performance verify, monitoring connect karo", assignedTo: "epc-partner", allowedRoles: ["epc-partner", "company"], enabled: true, slaDays: 3, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "Commissioning Report", fileType: "pdf", required: true }, { label: "Performance Test Results", fileType: "pdf", required: true }], actionLabel: "Commission System", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "in_c13", stepNumber: 13, title: "CEIG Approval (>10kW)", description: "Chief Electrical Inspector clearance mandatory for >10kW", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 14, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "CEIG Certificate", fileType: "pdf", required: true }, { label: "Inspection Report", fileType: "pdf", required: true }], actionLabel: "Get CEIG Approval", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_c14", stepNumber: 14, title: "Net Meter Installation", description: "DISCOM commercial net meter install kare", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 7, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "Net Meter Certificate", fileType: "pdf", required: true }, { label: "DISCOM Approval Letter", fileType: "pdf", required: true }], actionLabel: "Install Net Meter", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "in_c15", stepNumber: 15, title: "Final Payment", description: "Remaining payment release karo after milestones", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 3, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "Final Invoice", fileType: "pdf", required: true }, { label: "GST Invoice", fileType: "pdf", required: true }], actionLabel: "Release Payment", notifyCustomer: false, notifyEPC: true, notifyAdmin: true },
    { id: "in_c16", stepNumber: 16, title: "AMC Agreement", description: "Annual Maintenance Contract sign karo", assignedTo: "customer", allowedRoles: ["customer"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "AMC Contract", fileType: "pdf", required: true }, { label: "Warranty Documents", fileType: "pdf", required: true }], actionLabel: "Sign AMC", notifyCustomer: false, notifyEPC: false, notifyAdmin: true },
    { id: "in_c17", stepNumber: 17, title: "Handover + Project Closed", description: "Final documentation, system handover, project close", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Handover Certificate", fileType: "pdf", required: true }, { label: "As-Built Drawings", fileType: "pdf", required: true }], actionLabel: "Close Project", notifyCustomer: true, notifyEPC: true, notifyAdmin: false },
  ],
};

const AUSTRALIA_RESIDENTIAL = {
  projectType: "residential",
  projectTypeLabel: "Residential Solar",
  enabled: true,
  description: "Australia CEC compliant residential rooftop solar — 12 Steps, STC Auto-Calc at Step 1",
  steps: [
    { id: "au_res_1", stepNumber: 1, title: "Enquiry + Postcode → Zone → STC Auto Calc", description: "Postcode enter karo → Zone detect → STC count auto calculate → rebate estimate show", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Postcode", fileType: "text", required: true }, { label: "Monthly Bill Amount", fileType: "text", required: true }], actionLabel: "Calculate STC", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_res_2", stepNumber: 2, title: "Quote with STC Discount Shown Upfront", description: "Quote generate karo jisme STC rebate pehle se deducted ho", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Formal Quote", fileType: "pdf", required: true }], actionLabel: "View Quote", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_res_3", stepNumber: 3, title: "Site Assessment — CEC Accredited", description: "CEC accredited EPC site visit kare — roof condition, orientation, shading, load check", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Geo-tagged Site Photo", fileType: "image", required: true }, { label: "Roof Assessment Report", fileType: "pdf", required: true }, { label: "Shading Report", fileType: "pdf", required: true }], actionLabel: "Upload Survey Report", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_res_4", stepNumber: 4, title: "System Design — CEC Approved Products Only", description: "CEC approved panels + inverters choose karo, AS/NZS 5033 compliant design", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "System Design PDF", fileType: "pdf", required: true }, { label: "Single Line Diagram", fileType: "pdf", required: true }, { label: "Product Datasheets", fileType: "pdf", required: true }], actionLabel: "Submit System Design", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_res_5", stepNumber: 5, title: "Contract + STC Assignment Form Signed", description: "Customer STC rights EPC ko assign kare (mandatory for rebate).", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Signed STC Assignment Form", fileType: "pdf", required: true }, { label: "Signed Contract", fileType: "pdf", required: true }], actionLabel: "Sign & Upload Contract", notifyCustomer: false, notifyEPC: true, notifyAdmin: true },
    { id: "au_res_6", stepNumber: 6, title: "DNSP Grid Application (Before Install)", description: "Distribution Network Service Provider ko notify karo before installation", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 7, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "DNSP Application Form", fileType: "pdf", required: true }, { label: "Technical Specs", fileType: "pdf", required: true }, { label: "CEC Cert of EPC", fileType: "pdf", required: true }], actionLabel: "Submit Grid Application", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_res_7", stepNumber: 7, title: "Material + Install Date Confirmed", description: "EPC material procure kare + customer ke saath install date confirm kare", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "manual", actionLabel: "Confirm Install Date", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_res_8", stepNumber: 8, title: "Installation (1-2 days)", description: "CEC accredited installer install kare — at least 5 photos mandatory", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "AS/NZS 5033 Compliance Photos", fileType: "image", required: true }], actionLabel: "Upload Installation Proofs", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_res_9", stepNumber: 9, title: "Certificate of Electrical Safety (CES)", description: "State licensed electrician CES issue kare — mandatory before grid connection", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "CES Certificate", fileType: "pdf", required: true }], actionLabel: "Upload CES Certificate", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_res_10", stepNumber: 10, title: "DNSP Smart Meter Upgrade", description: "DNSP smart/interval meter install kare for export metering", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 14, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Smart Meter Upgrade Confirmation", fileType: "pdf", required: true }, { label: "Export Meter Photo", fileType: "image", required: true }], actionLabel: "Confirm Smart Meter Upgrade", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_res_11", stepNumber: 11, title: "STC Filed in REC Registry", description: "STCs CER ke REC Registry mein file karo, trade karo, rebate confirm karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 3, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "REC Registry Confirmation", fileType: "pdf", required: true }, { label: "STC Trade Confirmation", fileType: "pdf", required: true }, { label: "Rebate Statement", fileType: "pdf", required: true }], actionLabel: "File STCs", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_res_12", stepNumber: 12, title: "Project Closed + State Rebate Guidance", description: "Project close karo, customer ko FIT registration guide karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Completion Certificate", fileType: "pdf", required: true }, { label: "Warranty Documents", fileType: "pdf", required: true }, { label: "FIT Retailer Guide", fileType: "pdf", required: true }], actionLabel: "Close Project", notifyCustomer: true, notifyEPC: true, notifyAdmin: false },
  ]
};

const AUSTRALIA_COMMERCIAL = {
  projectType: "commercial",
  projectTypeLabel: "Commercial Solar",
  enabled: true,
  description: "Commercial rooftop solar for business premises — 14 Steps, includes DA and DNSP complex study",
  steps: [
    { id: "au_com_1", stepNumber: 1, title: "Commercial Enquiry + Energy Audit", description: "Business ka energy consumption analyze karo, ROI calculate karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "12 Months Bills", fileType: "pdf", required: true }, { label: "NMI Number", fileType: "text", required: true }, { label: "Load Profile", fileType: "pdf", required: true }], actionLabel: "Complete Energy Audit", notifyCustomer: false, notifyEPC: true, notifyAdmin: true },
    { id: "au_com_2", stepNumber: 2, title: "System Size Recommendation + ROI Calculator", description: "Detailed ROI proposal generate karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "ROI Proposal", fileType: "pdf", required: true }, { label: "Energy Model Report", fileType: "pdf", required: true }], actionLabel: "Generate ROI Proposal", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_com_3", stepNumber: 3, title: "Development Approval (DA) Check", description: "Council se DA check karo — most commercial need DA", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 14, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "DA Application", fileType: "pdf", required: true }, { label: "Council Response", fileType: "pdf", required: true }], actionLabel: "Verify DA Requirements", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_com_4", stepNumber: 4, title: "Site Assessment + Structural Engineering Report", description: "Structural engineer + EPC combined assessment", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Engineering Report", fileType: "pdf", required: true }, { label: "3-Phase Load Check", fileType: "pdf", required: true }, { label: "Roof Structural Cert", fileType: "pdf", required: true }], actionLabel: "Upload Engineering Report", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_com_5", stepNumber: 5, title: "System Design — 3-Phase, Large Inverter", description: "Commercial grade design — 3-phase inverter, string config, protection devices", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "3-Phase System Design", fileType: "pdf", required: true }, { label: "Single Line Diagram", fileType: "pdf", required: true }, { label: "Inverter Specs", fileType: "pdf", required: true }], actionLabel: "Submit 3-Phase Design", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_com_6", stepNumber: 6, title: "Commercial Contract + Finance Options", description: "Contract + finance sign karo", assignedTo: "customer", allowedRoles: ["customer"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Signed Commercial Contract", fileType: "pdf", required: true }, { label: "Finance Approval Letter", fileType: "pdf", required: true }, { label: "ABN Verification", fileType: "pdf", required: true }], actionLabel: "Sign Contract", notifyCustomer: false, notifyEPC: true, notifyAdmin: true },
    { id: "au_com_7", stepNumber: 7, title: "DNSP Application — Complex Network Study", description: "Commercial DNSP application complex hai", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 21, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "DNSP Technical Application", fileType: "pdf", required: true }, { label: "Network Study Request", fileType: "pdf", required: true }, { label: "Export Limit Agreement", fileType: "pdf", required: true }], actionLabel: "Submit DNSP Application", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_com_8", stepNumber: 8, title: "Equipment Procurement", description: "Commercial grade panels, 3-phase inverters procure karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 14, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Purchase Orders", fileType: "pdf", required: true }, { label: "Delivery Schedule", fileType: "pdf", required: true }], actionLabel: "Procure Commercial Gear", notifyCustomer: false, notifyEPC: false, notifyAdmin: true },
    { id: "au_com_9", stepNumber: 9, title: "Installation (3-10 days)", description: "Staged installation — civil, electrical, commissioning in phases", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 10, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Daily Progress Photos", fileType: "image", required: true }, { label: "Safety Management Plan", fileType: "pdf", required: true }, { label: "SWMS", fileType: "pdf", required: true }], actionLabel: "Upload Installation Proofs", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_com_10", stepNumber: 10, title: "Commissioning + Power Quality Testing", description: "Full system commissioning — power quality, anti-islanding", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Commissioning Report", fileType: "pdf", required: true }, { label: "Power Quality Test Results", fileType: "pdf", required: true }, { label: "Export Test Log", fileType: "pdf", required: true }], actionLabel: "Complete Testing", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_com_11", stepNumber: 11, title: "CES + Independent Electrical Inspector", description: "Commercial mein independent inspector mandatory", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "CES Certificate", fileType: "pdf", required: true }, { label: "Independent Inspection Certificate", fileType: "pdf", required: true }], actionLabel: "Upload CES", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_com_12", stepNumber: 12, title: "DNSP Final Activation + Smart Meter", description: "DNSP final grid activation kare", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 7, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Grid Connection Confirmation", fileType: "pdf", required: true }, { label: "Interval Meter Confirmation", fileType: "pdf", required: true }], actionLabel: "Activate Grid Export", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_com_13", stepNumber: 13, title: "STC Filed (<100kW) or LGC Setup (>100kW)", description: "<100kW: STCs file karo. >100kW: LGC register karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 5, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "STC Trade Confirmation or LGC Registration Certificate", fileType: "pdf", required: true }], actionLabel: "File STC / Setup LGC", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_com_14", stepNumber: 14, title: "Project Closed + Performance Monitoring", description: "Project close karo + commercial monitoring dashboard activate karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Commercial Completion Certificate", fileType: "pdf", required: true }, { label: "Warranty Pack", fileType: "pdf", required: true }, { label: "Monitoring Portal Access", fileType: "pdf", required: true }], actionLabel: "Activate Performance Dashboard", notifyCustomer: true, notifyEPC: true, notifyAdmin: false },
  ]
};

const AUSTRALIA_SOLAR_BATTERY = {
  projectType: "solar-battery",
  projectTypeLabel: "Solar + Battery",
  enabled: true,
  description: "Solar PV system with BESS battery energy storage — 13 Steps including AS/NZS 5139",
  steps: [
    { id: "au_bat_1", stepNumber: 1, title: "Enquiry + STC Auto Calc (Solar + Battery)", description: "Solar + battery package ke liye STC calculate karo", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Postcode", fileType: "text", required: true }, { label: "Monthly Bill", fileType: "text", required: true }, { label: "Battery Preference", fileType: "text", required: true }], actionLabel: "Calculate STC", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_bat_2", stepNumber: 2, title: "Quote — Solar + Battery Package with STC", description: "Quote mein solar STC + battery state rebate dono deduct karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Package Quote with STC Deducted", fileType: "pdf", required: true }, { label: "Battery Model Options", fileType: "pdf", required: true }], actionLabel: "View Package Quote", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_bat_3", stepNumber: 3, title: "Site Assessment — CEC Accredited", description: "Solar site + battery location assess karo", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Geo-tagged Site Photo", fileType: "image", required: true }, { label: "Battery Location Plan", fileType: "pdf", required: true }, { label: "Load Assessment", fileType: "pdf", required: true }], actionLabel: "Upload Site Assessment", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_bat_4", stepNumber: 4, title: "System Design — CEC Approved (Solar + Battery)", description: "CEC approved battery products mandatory", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Solar + Battery System Design", fileType: "pdf", required: true }, { label: "Single Line Diagram", fileType: "pdf", required: true }, { label: "Battery Datasheet", fileType: "pdf", required: true }], actionLabel: "Submit Solar+Battery Design", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_bat_5", stepNumber: 5, title: "Contract + STC Assignment Form Signed", description: "STC assignment form sign karo (solar part ke liye)", assignedTo: "customer", allowedRoles: ["customer", "bde"], canBeCompletedByBDE: true, enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Signed STC Assignment Form", fileType: "pdf", required: true }, { label: "Signed Contract", fileType: "pdf", required: true }], actionLabel: "Sign & Upload Contract", notifyCustomer: false, notifyEPC: true, notifyAdmin: true },
    { id: "au_bat_6", stepNumber: 6, title: "DNSP Application — Battery Export Rules", description: "Battery ke liye DNSP application different hai", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 7, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "DNSP Battery Application", fileType: "pdf", required: true }, { label: "Export Setting Agreement", fileType: "pdf", required: true }, { label: "VPP Info", fileType: "pdf", required: true }], actionLabel: "Submit Battery DNSP Application", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_bat_7", stepNumber: 7, title: "Material — Solar + Battery Procurement", description: "CEC approved battery + solar panels procure karo", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 5, isMandatory: true, completionCondition: "manual", actionLabel: "Procure Battery", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_bat_8", stepNumber: 8, title: "Installation — Solar + Battery (2-3 days)", description: "Solar install Day 1, battery install Day 2, wiring Day 3", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Battery Safety Photos", fileType: "image", required: true }, { label: "Solar Install Photos", fileType: "image", required: true }, { label: "Mounting Evidence", fileType: "image", required: true }], actionLabel: "Upload Installation Proofs", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_bat_9", stepNumber: 9, title: "Dual Compliance Certificate (CES + AS/NZS 5139)", description: "Two certificates required: (1) CES for solar, (2) AS/NZS 5139 for battery", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "CES Certificate", fileType: "pdf", required: true }, { label: "AS/NZS 5139 Battery Compliance Certificate", fileType: "pdf", required: true }], actionLabel: "Upload Dual Compliance Cert", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_bat_10", stepNumber: 10, title: "DNSP Smart Meter + Battery Meter Config", description: "Smart meter configure karo import/export tracking ke liye", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 10, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Smart Meter Confirmation", fileType: "pdf", required: true }, { label: "Import/Export Meter Config", fileType: "pdf", required: true }], actionLabel: "Configure Import/Export Meter", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_bat_11", stepNumber: 11, title: "VPP Enrollment (Optional)", description: "Virtual Power Plant mein enroll karo optional hai", assignedTo: "customer", allowedRoles: ["customer"], enabled: false, slaDays: 7, isMandatory: false, completionCondition: "document_upload", requiredActions: [{ label: "VPP Enrollment Confirmation", fileType: "pdf", required: false }], actionLabel: "Enroll in VPP", notifyCustomer: false, notifyEPC: false, notifyAdmin: true },
    { id: "au_bat_12", stepNumber: 12, title: "Solar STC + Battery STC Filed Separately", description: "Solar ke STCs aur battery ke STCs alag alag file karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 3, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "Solar STC Trade Confirmation", fileType: "pdf", required: true }, { label: "Battery STC Confirmation", fileType: "pdf", required: false }], actionLabel: "File Solar & Battery STCs", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_bat_13", stepNumber: 13, title: "Project Closed + Battery App Setup", description: "Project close karo + customer ko battery monitoring app setup karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Completion Certificate", fileType: "pdf", required: true }, { label: "Warranty (Solar + Battery)", fileType: "pdf", required: true }, { label: "Monitoring App Guide", fileType: "pdf", required: true }], actionLabel: "Complete Battery App Setup", notifyCustomer: true, notifyEPC: true, notifyAdmin: false },
  ]
};

const AUSTRALIA_FARM_RURAL = {
  projectType: "farm-rural",
  projectTypeLabel: "Farm / Rural Solar",
  enabled: true,
  description: "Rural, agricultural & off-grid solar — 14 Steps, includes DA and remote logistics",
  steps: [
    { id: "au_farm_1", stepNumber: 1, title: "Farm Energy Audit + Off-Grid vs Grid Assessment", description: "Farm ka total load assess karo — off-grid feasible hai ya grid-tied", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Farm Energy Audit Report", fileType: "pdf", required: true }, { label: "Load Analysis", fileType: "pdf", required: true }, { label: "Grid Distance Map", fileType: "image", required: true }], actionLabel: "Complete Load Analysis", notifyCustomer: false, notifyEPC: true, notifyAdmin: true },
    { id: "au_farm_2", stepNumber: 2, title: "Grid Connection Feasibility", description: "Rural area mein grid capacity limited hoti hai. DNSP se capacity check karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 5, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "DNSP Rural Capacity Report", fileType: "pdf", required: true }, { label: "Connection Cost Estimate", fileType: "pdf", required: true }], actionLabel: "Check Rural Grid Capacity", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_farm_3", stepNumber: 3, title: "Rural Development Approval (DA)", description: "Rural DA complex hai — longer timeline. Ground mount mein planning permit mandatory.", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 30, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "DA Application", fileType: "pdf", required: true }, { label: "Planning Permit", fileType: "pdf", required: true }, { label: "Vegetation Clearance", fileType: "pdf", required: false }], actionLabel: "Submit Rural DA Application", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_farm_4", stepNumber: 4, title: "Site Assessment — Roof + Ground Mount", description: "Roof mount + ground mount dono assess karo. Remote location logistics plan.", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Ground Mount Feasibility Report", fileType: "pdf", required: true }, { label: "Cable Run Plan", fileType: "pdf", required: true }, { label: "Soil Test", fileType: "pdf", required: false }], actionLabel: "Upload Ground Mount Assessment", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_farm_5", stepNumber: 5, title: "System Design — Grid or Off-Grid Configuration", description: "Off-grid mein larger battery bank + generator backup design karo", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Off-Grid/Hybrid System Design", fileType: "pdf", required: true }, { label: "Battery Sizing Report", fileType: "pdf", required: true }], actionLabel: "Submit Off-Grid Design", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_farm_6", stepNumber: 6, title: "Contract + Finance (Farm Loan / ATO Depreciation)", description: "Farm solar ke liye special finance options", assignedTo: "customer", allowedRoles: ["customer"], enabled: true, slaDays: 5, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Signed Contract", fileType: "pdf", required: true }, { label: "Farm Finance Approval", fileType: "pdf", required: true }, { label: "ATO Depreciation Schedule", fileType: "pdf", required: true }], actionLabel: "Sign Farm Contract & Finance", notifyCustomer: false, notifyEPC: true, notifyAdmin: true },
    { id: "au_farm_7", stepNumber: 7, title: "DNSP Application (If Grid-Tied)", description: "Rural DNSP application take longer — export limits often imposed.", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 21, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "Rural DNSP Application", fileType: "pdf", required: true }, { label: "Export Control Agreement", fileType: "pdf", required: true }], actionLabel: "Submit Rural DNSP Application", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_farm_8", stepNumber: 8, title: "Equipment + Remote Logistics Planning", description: "Remote location mein freight expensive hota hai. Crane/forklift hire karo.", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 14, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Freight Booking", fileType: "pdf", required: true }, { label: "Delivery Schedule", fileType: "pdf", required: true }, { label: "Site Access Plan", fileType: "pdf", required: true }], actionLabel: "Schedule Remote Logistics", notifyCustomer: false, notifyEPC: true, notifyAdmin: true },
    { id: "au_farm_9", stepNumber: 9, title: "Installation (3-7 days)", description: "Remote installation longer time lagta hai. Ground mount + roof mount combined.", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 7, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Daily Progress Photos", fileType: "image", required: true }, { label: "Ground Mount Assembly Photos", fileType: "image", required: true }, { label: "Cable Trenching Photos", fileType: "image", required: true }], actionLabel: "Complete Farm Install", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_farm_10", stepNumber: 10, title: "Compliance + Off-Grid Commissioning", description: "Off-grid: AS/NZS 4509 certificate mandatory. Grid-tied: CES", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 3, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "AS/NZS 4509 Off-Grid Certificate", fileType: "pdf", required: true }, { label: "CES (if grid-tied)", fileType: "pdf", required: false }, { label: "Commissioning Report", fileType: "pdf", required: true }], actionLabel: "Upload Off-Grid Cert", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_farm_11", stepNumber: 11, title: "DNSP Meter (Grid) or Battery Config (Off-Grid)", description: "Grid-tied: smart meter from DNSP. Off-grid: battery management system", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 7, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Rural Smart Meter Confirmation", fileType: "pdf", required: false }, { label: "Off-Grid Battery Config Report", fileType: "pdf", required: false }], actionLabel: "Configure Rural Metering", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_farm_12", stepNumber: 12, title: "STC (<100kW) or LGC Registration (>100kW)", description: "Farm solar often >100kW — check if LGC registration needed", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 5, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "STC Trade Confirmation or LGC Certificate", fileType: "pdf", required: true }], actionLabel: "Register STC / LGC", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_farm_13", stepNumber: 13, title: "ATO Asset Write-Off Documentation", description: "ATO immediate asset write-off eligible — tax invoice", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "ATO-compliant Tax Invoice", fileType: "pdf", required: true }, { label: "Depreciation Schedule", fileType: "pdf", required: true }, { label: "Asset Register Entry", fileType: "pdf", required: true }], actionLabel: "Issue ATO Tax Doc", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_farm_14", stepNumber: 14, title: "Project Closed + Remote Monitoring Setup", description: "Project close karo + 4G/Satellite monitoring activate karo for remote visibility", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Completion Certificate", fileType: "pdf", required: true }, { label: "Warranty Pack", fileType: "pdf", required: true }, { label: "4G/Satellite Monitoring Guide", fileType: "pdf", required: true }], actionLabel: "Activate Remote Monitoring", notifyCustomer: true, notifyEPC: true, notifyAdmin: false },
  ]
};

const AUSTRALIA_COMMUNITY_STRATA = {
  projectType: "community-strata",
  projectTypeLabel: "Community / Strata Solar",
  enabled: true,
  description: "Multi-tenant strata body corporate solar — 15 Steps, includes ENO registration and unit allocation",
  steps: [
    { id: "au_strata_1", stepNumber: 1, title: "Feasibility + Body Corporate Approach", description: "Body corporate committee ko present karo — shared savings model", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Shared Savings Feasibility Report", fileType: "pdf", required: true }, { label: "Unit-wise Savings Estimate", fileType: "pdf", required: true }], actionLabel: "Present Shared Savings Feasibility", notifyCustomer: false, notifyEPC: true, notifyAdmin: true },
    { id: "au_strata_2", stepNumber: 2, title: "Owners Corporation Vote (75% Majority)", description: "Strata meeting mein 75% majority vote mandatory", assignedTo: "customer", allowedRoles: ["customer"], enabled: true, slaDays: 30, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "Meeting Minutes with Vote Results", fileType: "pdf", required: true }, { label: "Strata Manager Confirmation", fileType: "pdf", required: true }], actionLabel: "Record 75% Strata Majority Vote", notifyCustomer: false, notifyEPC: false, notifyAdmin: true },
    { id: "au_strata_3", stepNumber: 3, title: "Strata Permit + DA Application", description: "Strata DA council se alag hoti hai. Strata manager se written consent", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 21, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "DA Application", fileType: "pdf", required: true }, { label: "Strata Permit", fileType: "pdf", required: true }, { label: "Common Property Consent", fileType: "pdf", required: true }], actionLabel: "Submit Strata DA Application", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_strata_4", stepNumber: 4, title: "Detailed Site Assessment", description: "Common roof + all unit access points assess karo. Sub-metering locations plan", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Common Roof Assessment", fileType: "pdf", required: true }, { label: "Cable Route Plan", fileType: "pdf", required: true }, { label: "Sub-meter Plan", fileType: "pdf", required: true }], actionLabel: "Upload Strata Assessment", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_strata_5", stepNumber: 5, title: "Embedded Network Design (ENO)", description: "Embedded Network Operator design — AER registration required", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 7, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "ENO Design", fileType: "pdf", required: true }, { label: "Sub-metering Layout", fileType: "pdf", required: true }, { label: "Credit Allocation Algorithm", fileType: "pdf", required: true }], actionLabel: "Design ENO", notifyCustomer: false, notifyEPC: true, notifyAdmin: true },
    { id: "au_strata_6", stepNumber: 6, title: "Individual Unit Consent + Contract", description: "Har unit owner se individual consent lena mandatory", assignedTo: "customer", allowedRoles: ["customer"], enabled: true, slaDays: 7, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Signed Unit Agreements (all units)", fileType: "pdf", required: true }, { label: "Opt-out Records", fileType: "pdf", required: true }], actionLabel: "Collect Unit Agreements", notifyCustomer: false, notifyEPC: true, notifyAdmin: true },
    { id: "au_strata_7", stepNumber: 7, title: "DNSP Application — Embedded Network Registration", description: "Embedded network AER mein register karna padta hai — complex process", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 28, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "AER/DNSP ENO Registration", fileType: "pdf", required: true }, { label: "Network Application", fileType: "pdf", required: true }, { label: "Export Agreement", fileType: "pdf", required: true }], actionLabel: "Register Embedded Network", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_strata_8", stepNumber: 8, title: "Installation — Common Roof (3-5 days)", description: "Common roof installation — building manager coordinate karo", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 5, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Daily Progress Photos", fileType: "image", required: true }, { label: "Common Area Install Photos", fileType: "image", required: true }], actionLabel: "Complete Common Roof Install", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_strata_9", stepNumber: 9, title: "Common Area Electrical Work", description: "Sub-metering install karo har unit ke liye + common area distribution board upgrade karo", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Sub-meter Installation Photos", fileType: "image", required: true }, { label: "Distribution Board Photos", fileType: "image", required: true }], actionLabel: "Install Sub-metering", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_strata_10", stepNumber: 10, title: "CES + Embedded Network Compliance", description: "CES + ENO compliance dono mandatory. AER confirmation letter attach karo", assignedTo: "epc-partner", allowedRoles: ["epc-partner"], enabled: true, slaDays: 2, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "CES Certificate", fileType: "pdf", required: true }, { label: "ENO Compliance Certificate", fileType: "pdf", required: true }, { label: "AER Confirmation", fileType: "pdf", required: true }], actionLabel: "Upload Strata Compliance", notifyCustomer: true, notifyEPC: true, notifyAdmin: true },
    { id: "au_strata_11", stepNumber: 11, title: "DNSP Activation + Building Parent Meter", description: "Building parent meter activate karo + unit sub-meters link karo", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 7, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Parent Meter Activation Confirmation", fileType: "pdf", required: true }, { label: "Grid Export Settings", fileType: "pdf", required: true }], actionLabel: "Activate Building Parent Meter", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_strata_12", stepNumber: 12, title: "Solar Allocation System Setup", description: "Software configure karo jo solar generation units mein pro-rata distribute kare", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 3, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Credit Allocation Software Config", fileType: "pdf", required: true }, { label: "Unit Portal Logins", fileType: "pdf", required: true }], actionLabel: "Configure Allocation Software", notifyCustomer: true, notifyEPC: false, notifyAdmin: false },
    { id: "au_strata_13", stepNumber: 13, title: "STC Filed (Building as One Unit)", description: "Poori building ek unit mein count hoti hai STCs ke liye", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 3, isMandatory: true, requiresAdminApproval: true, completionCondition: "admin_approval", requiredActions: [{ label: "STC Trade Confirmation", fileType: "pdf", required: true }, { label: "REC Registry Certificate", fileType: "pdf", required: true }], actionLabel: "File Building STC", notifyCustomer: true, notifyEPC: false, notifyAdmin: true },
    { id: "au_strata_14", stepNumber: 14, title: "Body Corporate Report + Unit Billing Setup", description: "Body corporate ko quarterly solar report generate karo. Unit levy credit setup", assignedTo: "customer", allowedRoles: ["customer"], enabled: true, slaDays: 2, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Body Corporate Solar Report", fileType: "pdf", required: true }, { label: "Updated Unit Levy Schedule", fileType: "pdf", required: true }], actionLabel: "Setup Solar Credits on Unit Bills", notifyCustomer: false, notifyEPC: false, notifyAdmin: true },
    { id: "au_strata_15", stepNumber: 15, title: "Project Closed + Unit Owner Portal Activation", description: "Project close karo + unit owners ko individual portal access do", assignedTo: "company", allowedRoles: ["company"], enabled: true, slaDays: 1, isMandatory: true, completionCondition: "document_upload", requiredActions: [{ label: "Completion Report", fileType: "pdf", required: true }, { label: "Unit Owner Guide", fileType: "pdf", required: true }, { label: "Portal Login Letters", fileType: "pdf", required: true }], actionLabel: "Activate Unit Owner Portal Access", notifyCustomer: true, notifyEPC: true, notifyAdmin: false },
  ]
};

// NZ, UK, USA also have Residential & Commercial, they are identical structure-wise to the others
const NZ_RESIDENTIAL = clone(INDIA_RESIDENTIAL);
NZ_RESIDENTIAL.description = "New Zealand residential solar journey";
NZ_RESIDENTIAL.steps.forEach(s => s.id = s.id.replace('in_', 'nz_'));

const NZ_COMMERCIAL = clone(INDIA_COMMERCIAL);
NZ_COMMERCIAL.description = "New Zealand commercial solar journey";
NZ_COMMERCIAL.steps.forEach(s => s.id = s.id.replace('in_', 'nz_'));

const UK_RESIDENTIAL = clone(INDIA_RESIDENTIAL);
UK_RESIDENTIAL.description = "UK MCS compliant residential solar journey";
UK_RESIDENTIAL.steps.forEach(s => s.id = s.id.replace('in_', 'uk_'));

const UK_COMMERCIAL = clone(INDIA_COMMERCIAL);
UK_COMMERCIAL.description = "UK commercial solar journey";
UK_COMMERCIAL.steps.forEach(s => s.id = s.id.replace('in_', 'uk_'));

const USA_RESIDENTIAL = clone(INDIA_RESIDENTIAL);
USA_RESIDENTIAL.description = "USA residential solar journey (Loans/PPA)";
USA_RESIDENTIAL.steps.forEach(s => s.id = s.id.replace('in_', 'us_'));

const USA_COMMERCIAL = clone(INDIA_COMMERCIAL);
USA_COMMERCIAL.description = "USA commercial solar journey";
USA_COMMERCIAL.steps.forEach(s => s.id = s.id.replace('in_', 'us_'));

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

const DEFAULT_GLOBAL_SETTINGS = {
  autoProgressOnCompletion: true,
  requireEvidenceAtEachStep: false,
  sendSMSNotifications: true,
  sendEmailNotifications: true,
  allowEPCToUpdateSteps: true,
  customerPortalVisible: true,
  minBookingDays: 5,
};

const initializeCountry = async (countryName, journeysArray) => {
  await OrderJourneySettings.findOneAndUpdate(
    { country: countryName, state: "all", district: "all" },
    {
      country: countryName,
      state: "all",
      district: "all",
      discom: "all",
      _settingsKey: Math.random().toString(),
      journeys: journeysArray,
      globalSettings: DEFAULT_GLOBAL_SETTINGS
    },
    { upsert: true }
  );
};

export const getOrderJourneySettings = async (req, res) => {
  try {
    let country = req.query.country;
    let state = req.headers['x-state'] || req.query.state || 'all';
    let district = req.headers['x-district'] || req.query.district || 'all';
    let discom = req.headers['x-discom'] || req.query.discom || 'all';

    let settings = await OrderJourneySettings.findOne({ country, state, district, discom });

    if (!settings || !settings.journeys || settings.journeys.length === 0) {
      if (country === 'india') {
        await initializeCountry("india", [INDIA_RESIDENTIAL, INDIA_COMMERCIAL]);
      } else if (country === 'australia') {
        await initializeCountry("australia", [
          AUSTRALIA_RESIDENTIAL,
          AUSTRALIA_COMMERCIAL,
          AUSTRALIA_SOLAR_BATTERY,
          AUSTRALIA_FARM_RURAL,
          AUSTRALIA_COMMUNITY_STRATA
        ]);
      } else {
        await initializeCountry(country, [NZ_RESIDENTIAL]);
      }
      settings = await OrderJourneySettings.findOne({ country, state, district, discom });
    } else {
      // ── MIGRATION CHECK: Ensure country has correct project types from PDF ──
      if (country === 'india') {
        const types = settings.journeys.map(j => j.projectType);
        if (types.includes('group') || types.includes('common-meter') || settings.journeys.length !== 2) {
          settings.journeys = [INDIA_RESIDENTIAL, INDIA_COMMERCIAL];
          await settings.save();
        }
      } else if (country === 'australia') {
        const types = settings.journeys.map(j => j.projectType);
        if (!types.includes('solar-battery') || !types.includes('farm-rural') || !types.includes('community-strata') || settings.journeys.length !== 5) {
          settings.journeys = [
            AUSTRALIA_RESIDENTIAL,
            AUSTRALIA_COMMERCIAL,
            AUSTRALIA_SOLAR_BATTERY,
            AUSTRALIA_FARM_RURAL,
            AUSTRALIA_COMMUNITY_STRATA
          ];
          await settings.save();
        }
      }
    }

    res.json({ success: true, data: settings });
  } catch (err) {
    console.error("getOrderJourneySettings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const saveOrderJourneySettings = async (req, res) => {
  try {
    const country = req.body.country || req.headers['x-country'];
    const state = req.body.state || req.headers['x-state'] || 'all';
    const district = req.body.district || req.headers['x-district'] || 'all';
    const discom = req.body.discom || req.headers['x-discom'] || 'all';
    const { journeys, globalSettings } = req.body;

    let settings = await OrderJourneySettings.findOne({ country, state, district, discom: discom || 'all' });

    if (!settings) {
      settings = new OrderJourneySettings({
        country, state, district, discom: discom || 'all', _settingsKey: Math.random().toString()
      });
    }

    if (journeys) settings.journeys = journeys;
    if (globalSettings) settings.globalSettings = globalSettings;

    await settings.save();

    // Dynamically sync updated steps parameters to active, uncompleted project orders
    if (journeys && journeys.length > 0) {
      for (const j of journeys) {
        const activeProjects = await ProjectOrder.find({
          projectType: j.projectType,
          status: { $nin: ["completed", "cancelled"] }
        });

        for (const p of activeProjects) {
          let updated = false;
          p.steps.forEach((step) => {
            // Find corresponding step config in master journey (match by stepNumber or stepId or id)
            const masterStep = j.steps.find((s) => 
              s.id === step.stepId || 
              s.id === step.id || 
              s.stepId === step.stepId ||
              s.stepNumber === step.stepNumber
            );

            if (masterStep) {
              // Only sync settings if the step is not completed yet
              if (step.status === "in-progress" || step.status === "pending" || step.status === "awaiting-approval") {
                step.requiresDocumentUpload = masterStep.requiresDocumentUpload;
                step.requiresDoc = masterStep.requiresDoc || masterStep.requiresDocumentUpload;
                step.requiredActions = masterStep.requiredActions || [];
                step.documentRequirements = masterStep.documentRequirements || [];
                step.documentName = masterStep.documentName;
                step.requiresAdminApproval = masterStep.requiresAdminApproval;
                step.visibleToCustomer = masterStep.visibleToCustomer;
                step.visibleToEpc = masterStep.visibleToEpc;
                step.notifyCustomer = masterStep.notifyCustomer !== false;
                step.notifyEPC = masterStep.notifyEPC || false;
                step.notifyAdmin = masterStep.notifyAdmin || false;
                updated = true;
              }
            }
          });
          if (updated) {
            p.markModified("steps");
            await p.save();
          }
        }
      }
    }

    res.json({ success: true, data: settings, message: "Settings saved and active workflows synced successfully" });
  } catch (err) {
    console.error("saveOrderJourneySettings error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetOrderJourneySettings = async (req, res) => {
  try {
    const country = req.query.country;
    
    // Wipe all and re-seed to get fresh defaults for the requested country
    await OrderJourneySettings.deleteMany({ country });
    
    if (country === 'india') await initializeCountry("india", [INDIA_RESIDENTIAL, INDIA_COMMERCIAL]);
    if (country === 'australia') await initializeCountry("australia", [
      AUSTRALIA_RESIDENTIAL,
      AUSTRALIA_COMMERCIAL,
      AUSTRALIA_SOLAR_BATTERY,
      AUSTRALIA_FARM_RURAL,
      AUSTRALIA_COMMUNITY_STRATA
    ]);
    if (country === 'newzealand') await initializeCountry("newzealand", NZ_RESIDENTIAL);
    if (country === 'uk') await initializeCountry("uk", UK_RESIDENTIAL);
    if (country === 'usa') await initializeCountry("usa", USA_RESIDENTIAL);

    const reset = await OrderJourneySettings.findOne({ country });
    res.json({ success: true, data: reset, message: "Reset to defaults for " + country });
  } catch (err) {
    console.error("resetOrderJourneySettings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPublicJourney = async (req, res) => {
  try {
    const { projectType } = req.params;
    const country = req.query.country || req.country;
    const state = req.headers['x-state'] || req.query.state || 'all';
    const district = req.headers['x-district'] || req.query.district || 'all';
    const discom = req.headers['x-discom'] || req.query.discom || 'all';

    let settings = await OrderJourneySettings.findOne({ country, state, district, discom });
    
    // Fallback logic
    if (!settings && discom !== 'all') {
      settings = await OrderJourneySettings.findOne({ country, state, district, discom: 'all' });
    }
    if (!settings && district !== 'all') {
      settings = await OrderJourneySettings.findOne({ country, state, district: 'all', discom: 'all' });
    }
    if (!settings && state !== 'all') {
      settings = await OrderJourneySettings.findOne({ country, state: 'all', district: 'all', discom: 'all' });
    }
    if (!settings) {
      return res.status(404).json({ success: false, message: "No settings found for this country" });
    }

    const journey = settings.journeys.find(
      (j) => j.projectType === projectType && j.enabled
    );

    if (!journey) {
      return res.status(404).json({ success: false, message: "Journey not found for this project type" });
    }

    const publicJourney = {
      ...journey.toObject(),
      steps: journey.steps.filter((s) => s.enabled),
    };

    res.json({ success: true, data: publicJourney });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
