import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import { ProjectOrder } from "../models/ProjectModel.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
});

// Create Order for Razorpay
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body;
    
    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      data: order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to create payment order", error: error.message });
  }
};

// Verify Razorpay Payment Signature
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, projectId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Verification successful
      if (projectId) {
        const order = await ProjectOrder.findById(projectId);
        if (order) {
          order.paymentStatus = 'paid';
          order.razorpayPaymentId = razorpay_payment_id;
          order.razorpaySignature = razorpay_signature;
          await order.save();

          // If assignedEPCId exists (CUSTOMER_SELECT flow), create the enquiry
          if (order.assignedEPCId) {
            const enquiry = new EpcEnquiry({
              projectOrderId: order._id,
              orderNumber: order.orderNumber,
              customerName: order.customerName,
              customerMobile: order.customerMobile,
              customerEmail: order.customerEmail,
              location: order.location,
              systemSizeKW: order.systemSizeKW,
              projectType: order.projectType,
              projectTypeLabel: order.projectTypeLabel,
              totalProjectCost: order.totalProjectCost,
              estimatedSubsidy: order.estimatedSubsidy,
              monthlyBillAmount: order.monthlyBillAmount,
              preferredInstallDate: order.preferredInstallDate,
              assignedEPCId: order.assignedEPCId,
              status: 'Pending',
              history: [{
                status: 'Pending',
                note: `Order assigned by customer directly`,
              }]
            });
            await enquiry.save();
          }
        }
      }

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    res.status(500).json({ success: false, message: "Internal server error during verification" });
  }
};
