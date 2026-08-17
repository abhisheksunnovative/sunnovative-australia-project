import express from 'express';
import {
  getCompaniesByState,
  loginCheck,
  loginSendOtp,
  loginVerifyOtp,
  loginWithPin,
  setPin,
  resetPinSendOtp,
  resetPinVerify,
  validateGst,
  validateMobile,
  verifyMobileOtp,
  registerEpc,
  getEpcProfile,
  updateEpcProfile,
  applyTrustBadge,
  createTrustBadgeOrder,
  verifyTrustBadgePayment,
  getTrustBadgeAnalytics,
} from '../controllers/epcAuthController.js';
import { protectEpc, protectEpcBasic } from '../middleware/protectEpc.js';
import { extractCountry } from '../middleware/countryMiddleware.js';

const router  = express.Router();
router.use(extractCountry);

router.get ('/companies',         getCompaniesByState);
router.post('/login-check',       loginCheck);
router.post('/login-send-otp',    loginSendOtp);
router.post('/login-verify-otp',  loginVerifyOtp);
router.post('/login-with-pin',    loginWithPin);
router.post('/set-pin',           protectEpcBasic, setPin);
router.post('/reset-pin-otp',     resetPinSendOtp);
router.post('/reset-pin-verify',  resetPinVerify);
router.post('/validate-gst',      validateGst);
router.post('/validate-mobile',   validateMobile);
router.post('/verify-mobile-otp', verifyMobileOtp);
router.post('/register',          registerEpc);
router.get ('/profile',           protectEpc, getEpcProfile);
router.put ('/profile',           protectEpc, updateEpcProfile);
router.post('/trust-badge/apply', protectEpc, applyTrustBadge);
router.post('/trust-badge/create-order', protectEpc, createTrustBadgeOrder);
router.post('/trust-badge/verify-payment', protectEpc, verifyTrustBadgePayment);
router.get ('/trust-badge/analytics', protectEpc, getTrustBadgeAnalytics);

export default router;
