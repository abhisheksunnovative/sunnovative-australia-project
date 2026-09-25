const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `    } catch(e) {
      console.error(e);
      alert("Failed to generate regex from selection.");
    }`;

const replacement = `    } catch(e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to generate regex from selection.");
    }`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacement);
    fs.writeFileSync(file, code);
    console.log("Successfully patched frontend error alert");
} else {
    console.log("Could not find target string.");
}
