const fs = require('fs');

let controller = fs.readFileSync('../Website_Backend/src/controllers/customerAuthController.js', 'utf8');
if (!controller.includes('if (req.body.checkOnly)')) {
  controller = controller.replace(
    'const otp = genOtp();',
    `if (req.body.checkOnly) {
      return res.json({
        success: true,
        isNewUser: isNew,
        pinSet: customer?.pinSet || false,
        message: "User status checked"
      });
    }
    const otp = genOtp();`
  );
  fs.writeFileSync('../Website_Backend/src/controllers/customerAuthController.js', controller);
}

let frontend = fs.readFileSync('../Website_Frontend/src/customer/CustomerLogin.jsx', 'utf8');
// Fix payload in handleForgotPin
frontend = frontend.replace(
  'const handleForgotPin = async () => {\n    clear(); setLoading(true);\n    \n    const payload = isIndia ? { mobile, checkOnly: true } : { email, checkOnly: true };',
  'const handleForgotPin = async () => {\n    clear(); setLoading(true);\n    \n    const payload = isIndia ? { mobile } : { email };'
);
// Fix payload in handleSendOtpNew
frontend = frontend.replace(
  'const payload = isIndia ? { mobile, checkOnly: true, fullName: fullName.trim() } : { email, checkOnly: true, fullName: fullName.trim() };',
  'const payload = isIndia ? { mobile, fullName: fullName.trim() } : { email, fullName: fullName.trim() };'
);
// Wait, my global replace was: 
// const payload = isIndia ? { mobile, checkOnly: true } : { email, checkOnly: true };
// handleSendOtpNew payload might be different. Let's just fix it smartly.

fs.writeFileSync('../Website_Frontend/src/customer/CustomerLogin.jsx', frontend);
console.log("Patched OTP logic!");
