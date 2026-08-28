const fs = require('fs');
const path = 'Website_Backend/src/controllers/lightBillEligibilityController.js';
let text = fs.readFileSync(path, 'utf8');

const oldBasePrice = `    let basePrice = suggestedKW * 60000; // default fallback`;
const newBasePrice = `    // AU specific snapping logic
    if (countryStr === 'australia' || countryStr === 'au') {
      const snapSizes = [3, 5, 6.6, 8.8, 10, 13, 15, 20];
      let bestSnap = snapSizes[0];
      let minDiff = Math.abs(suggestedKW - snapSizes[0]);
      for (let i = 1; i < snapSizes.length; i++) {
        const diff = Math.abs(suggestedKW - snapSizes[i]);
        if (diff < minDiff) {
          minDiff = diff;
          bestSnap = snapSizes[i];
        }
      }
      suggestedKW = bestSnap;
    }

    let basePrice = (countryStr === 'australia' || countryStr === 'au') ? (suggestedKW * 1100) : (suggestedKW * 60000); // default fallback`;
text = text.replace(oldBasePrice, newBasePrice);


const oldSubsidyBlock = `    if (suggestedKW > 0) {
      let applicableKw = Math.min(suggestedKW, dat.subsidyCriteria.maxSubsidyKW || 3);
      
      // Central Subsidy
      if (settings.centralSubsidyTiers && settings.centralSubsidyTiers.length > 0) {
        for (const tier of settings.centralSubsidyTiers) {
          if (applicableKw >= tier.minKW) {
            let kwInTier = Math.min(applicableKw - tier.minKW + 1, tier.maxKW - tier.minKW + 1);
            if (kwInTier > 0) {
              totalSubsidy += (kwInTier * tier.subsidyPerKW);
            }
          }
        }
      }
      
      // State Subsidy
      if (settings.stateSubsidies && settings.stateSubsidies.length > 0) {
        const stateSub = settings.stateSubsidies.find(s => s.state.toLowerCase() === state.toLowerCase());
        if (stateSub) {
          let stateAdd = applicableKw * stateSub.subsidyPerKW;
          if (stateSub.maxSubsidyAmount) {
            stateAdd = Math.min(stateAdd, stateSub.maxSubsidyAmount);
          }
          totalSubsidy += stateAdd;
        }
      }
    }`;

const newSubsidyBlock = `    if (suggestedKW > 0) {
      if (countryStr === 'australia' || countryStr === 'au') {
        let zoneRating = 1.382; // Zone 3 default
        if (state) {
          const s = state.toLowerCase();
          if (s.includes('qld') || s.includes('nt') || s.includes('wa') || s.includes('zone 1') || s.includes('zone 2')) zoneRating = 1.382;
          if (s.includes('vic') || s.includes('tas') || s.includes('act') || s.includes('zone 4')) zoneRating = 1.185; 
        }
        totalSubsidy = Math.floor(suggestedKW * zoneRating * 6 * 38);
      } else {
        let applicableKw = Math.min(suggestedKW, dat.subsidyCriteria.maxSubsidyKW || 3);
        
        // Central Subsidy
        if (settings.centralSubsidyTiers && settings.centralSubsidyTiers.length > 0) {
          for (const tier of settings.centralSubsidyTiers) {
            if (applicableKw >= tier.minKW) {
              let kwInTier = Math.min(applicableKw - tier.minKW + 1, tier.maxKW - tier.minKW + 1);
              if (kwInTier > 0) {
                totalSubsidy += (kwInTier * tier.subsidyPerKW);
              }
            }
          }
        }
        
        // State Subsidy
        if (settings.stateSubsidies && settings.stateSubsidies.length > 0) {
          const stateSub = settings.stateSubsidies.find(s => s.state.toLowerCase() === state.toLowerCase());
          if (stateSub) {
            let stateAdd = applicableKw * stateSub.subsidyPerKW;
            if (stateSub.maxSubsidyAmount) {
              stateAdd = Math.min(stateAdd, stateSub.maxSubsidyAmount);
            }
            totalSubsidy += stateAdd;
          }
        }
      }
    }`;

text = text.replace(oldSubsidyBlock, newSubsidyBlock);

const oldNet = `netAfterSubsidy: Math.max(10000, basePrice - totalSubsidy),`;
const newNet = `netAfterSubsidy: Math.max((countryStr === 'australia' || countryStr === 'au' ? 1500 : 10000), basePrice - totalSubsidy),`;
text = text.replace(oldNet, newNet);

fs.writeFileSync(path, text);
console.log("Subsidy logic and snapping replaced successfully.");
