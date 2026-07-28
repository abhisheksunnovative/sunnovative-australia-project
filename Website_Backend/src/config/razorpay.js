import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

// Requires these in your .env:
//   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
//   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
// Get these from Razorpay Dashboard → Settings → API Keys
// (use rzp_test_ keys while developing, switch to rzp_live_ before going live)

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️  RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing in .env — wallet recharge payments will fail.');
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});