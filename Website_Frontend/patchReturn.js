import fs from 'fs';

let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

// 1. Make handleCheckEligibility return the data
const oldReturn = /setFetchedData\(\(prev\) => \(\{\n\s*\.\.\.\(prev \|\| \{\}\),\n\s*consumerName: prev\?\.consumerName \|\| fullName \|\| "\?\?\?",/m;
const newReturn = `setFetchedData((prev) => ({
        ...(prev || {}),
        consumerName: prev?.consumerName || fullName || "???",`;
content = content.replace(oldReturn, newReturn); // This is just matching.

const catchEndRegex = /setEligibilityError\(err\.response\?\.data\?\.message \|\| "Failed to check eligibility"\);\n\s*\}\n\s*setIsCheckingEligibility\(false\);\n\s*\};/m;
const newCatchEnd = `setEligibilityError(err.response?.data?.message || "Failed to check eligibility");
      return null;
    } finally {
      setIsCheckingEligibility(false);
    }
  };`;

if (content.includes("setIsCheckingEligibility(false);\n  };")) {
  content = content.replace("setIsCheckingEligibility(false);\n  };", "setIsCheckingEligibility(false);\n      return data;\n    } catch (err) {\n      console.error(err);\n      setEligibilityError(err.response?.data?.message || \"Failed to check eligibility\");\n      return null;\n    } finally {\n      setIsCheckingEligibility(false);\n    }\n  };");
} else {
  // Let's just do a simple replace for handleCheckEligibility's end
  const regexToReplace = /setIsCheckingEligibility\(false\);\n\s*\};/m;
  content = content.replace(regexToReplace, "setIsCheckingEligibility(false);\n    return data;\n  };");
}

fs.writeFileSync('src/components/LeadForm.jsx', content);
console.log("Patched LeadForm.jsx for handleCheckEligibility return");
