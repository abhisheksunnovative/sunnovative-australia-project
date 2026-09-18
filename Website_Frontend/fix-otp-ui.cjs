const fs = require('fs');

let code = fs.readFileSync('src/customer/CustomerLogin.jsx', 'utf8');

// For returning users
code = code.replace(
  'setStep("otp"); setInfo(dataOtp.message || "OTP Sent");',
  'setStep("otp"); setInfo((dataOtp.message || "OTP Sent") + (dataOtp.dummyOtp ? " (OTP: " + dataOtp.dummyOtp + ")" : ""));'
);

// For new users
code = code.replace(
  'setInfo(data.message);',
  'setInfo(data.message + (data.dummyOtp ? " (OTP: " + data.dummyOtp + ")" : ""));'
);

// For forgotten pin
code = code.replace(
  'setInfo("OTP sent - verify to set a new PIN");',
  'setInfo("OTP sent - verify to set a new PIN" + (data.dummyOtp ? " (OTP: " + data.dummyOtp + ")" : ""));'
);

fs.writeFileSync('src/customer/CustomerLogin.jsx', code);
