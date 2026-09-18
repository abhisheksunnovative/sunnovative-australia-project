const fs = require('fs');

const path = 'Website_Frontend/src/components/LeadForm.jsx';
let content = fs.readFileSync(path, 'utf8');

const resetLogic = `
          // Reset all form state variables so no old data remains
          setFullName("");
          setMobileNumber("");
          setEmail("");
          setCity("Rajkot");
          setCustomerState("Gujarat");
          setMonthlyBill(getCountryCode() === "AU" ? 300 : 2500);
          setPostcode("");
          setRetailer("AGL");
          setConsumerNumber("");
          setUploadedFile(null);
          setPreferredBrands({});
          setSelectedUpgradeKw(0);
          setSelectedKw(0);
          setCustomKw(null);
          setScannedStcInfo(null);
          setScannedRetailer(null);
          setScannedBillingPeriod(null);
          setScannedQuarterlyKwh(null);
          setDynamicValues({});
          setFetchedData(null);
          setMeterCategory(null);
          setDiscom(null);
          setTariffDesc(null);
          setBillStatus(null);
          setDueAmount(0);
          setOcrMonthlyUnits(null);
          setEligibilityResult(null);
          setEligibilityError("");
          setScanConfidence(null);
          setScanError("");
`;

if (!content.includes('setFullName("");')) {
  content = content.replace(
    'alert("Enquiry Submitted Successfully!");',
    `alert("Enquiry Submitted Successfully!");\n${resetLogic}`
  );
  fs.writeFileSync(path, content);
}
