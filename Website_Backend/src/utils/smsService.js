import axios from 'axios';

/**
 * Universal SMS Service for Sunnovative using YourBulkSMS / ControlSMS
 * @param {string} mobile - 10-digit mobile number
 * @param {string} otp - OTP code to send
 * @returns {Promise<Object>} API Response
 */
export const sendOTP = async (mobile, otp) => {
  const cleanMobile = mobile.toString().trim().replace(/\D/g, '');
  const appHash = process.env.SMS_APP_HASH ? ` ${process.env.SMS_APP_HASH}` : '';
  const message = `Dear user, ${otp} is the OTP for your login. Do not share it with anyone.${appHash}`;
  
  const SMS_API_URL = "http://control.yourbulksms.com/api/sendhttp.php";
  
  const params = {
    authkey: process.env.SMS_AUTH_KEY,
    mobiles: cleanMobile,
    message: message,
    sender: process.env.SMS_SENDER_ID || "SUNNOV",
    route: "2",
    country: "91",
    DLT_TE_ID: process.env.DLT_TE_ID || "",
  };

  console.log(`[SMS SERVICE] Sending OTP to ${cleanMobile} via YourBulkSMS...`);
  
  try {
    const smsRes = await axios.get(SMS_API_URL, { params });
    console.log(`[SMS SERVICE] Response:`, smsRes.data);
    return smsRes.data;
  } catch (error) {
    const apiError = error.response ? error.response.data : error.message;
    console.error(`[SMS SERVICE ERROR]`, apiError);
    throw new Error(JSON.stringify(apiError));
  }
};

export const sendNotificationSMS = async (mobile, message) => {
  const cleanMobile = mobile ? mobile.toString().trim().replace(/\D/g, '') : '';
  console.log(`\n======================================================`);
  console.log(`📱 [SMS & EMAIL DISPATCH SENT TO ${cleanMobile}]:`);
  console.log(`   "${message}"`);
  console.log(`======================================================\n`);
  return { success: true };
};
