import express from 'express';
import {
  getWallet,
  createRechargeOrder,
  verifyRechargePayment,
  checkEligibility,
  refundCredits,
  transferKW,
} from '../controllers/epcWalletController.js';
import { getPublicWalletSettings } from '../controllers/epcWalletSettingsController.js';
import { protectEpc } from '../middleware/protectEpc.js';

const router = express.Router();

router.get ('/',                  protectEpc, getWallet);

// Razorpay 2-step recharge flow (replaces the old direct /purchase endpoint)
router.post('/create-order',      protectEpc, createRechargeOrder);
router.post('/verify-payment',    protectEpc, verifyRechargePayment);

router.post('/check-eligibility', protectEpc, checkEligibility);
router.post('/refund',            protectEpc, refundCredits);
router.post('/transfer',          protectEpc, transferKW);
router.get ('/settings/public',   protectEpc, getPublicWalletSettings);

export default router;