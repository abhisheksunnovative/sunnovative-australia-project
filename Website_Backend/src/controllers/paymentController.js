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

    
    let order;
    try {
        order = await razorpay.orders.create(options);
    } catch(err) {
        if (process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_')) {
            console.warn("Razorpay error on test key, falling back to simulated mode. Error:", err.error?.description);
            const mockOrderId = `mock_${stage}_ord_${Date.now()}`;
            project.stagePayments[stageIndex].razorpayOrderId = mockOrderId;
            await project.save();
            return res.json({
              success: true,
              isSimulated: true,
              data: { id: mockOrderId, amount: stageAmount * 100, currency },
              key_id: "rzp_test_placeholder"
            });
        } else {
            throw err;
        }
    }
    
    
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
          if (order.signupTokenPayment) {
            order.signupTokenPayment.status = 'paid';
            order.signupTokenPayment.paidAt = new Date();
            order.signupTokenPayment.razorpayOrderId = razorpay_order_id;
            order.signupTokenPayment.razorpayPaymentId = razorpay_payment_id;
            order.signupTokenPayment.razorpaySignature = razorpay_signature;
          }
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

// ── CUSTOMER SIGN-UP TOKEN PAYMENT ──

// Create Razorpay Order for Platform Token
export const createTokenOrder = async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await ProjectOrder.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!project.signupTokenPayment?.enabled || project.signupTokenPayment.status === "paid") {
      return res.status(400).json({ success: false, message: "Signup token payment not required or already paid" });
    }

    const tokenAmount = project.signupTokenPayment.amount || 0;
    if (tokenAmount <= 0) {
      // Auto-mark as paid if amount is 0
      project.signupTokenPayment.status = "paid";
      project.signupTokenPayment.paidAt = new Date();
      await project.save();
      return res.json({ success: true, alreadyPaid: true });
    }

    const currency = (project.country === "australia" || project.country === "au") ? "AUD" : "INR";

    // Handle mock keys
    if (process.env.RAZORPAY_KEY_ID === "rzp_test_placeholder" || !process.env.RAZORPAY_KEY_ID) {
      const mockOrderId = `mock_tok_ord_${Date.now()}`;
      project.signupTokenPayment.razorpayOrderId = mockOrderId;
      await project.save();
      return res.json({
        success: true,
        isSimulated: true,
        data: { id: mockOrderId, amount: tokenAmount * 100, currency },
        key_id: "rzp_test_placeholder"
      });
    }

    const options = {
      amount: Math.round(tokenAmount * 100),
      currency,
      receipt: `token_rcpt_${project.orderNumber || project._id}`,
      notes: { projectId: project._id.toString(), type: "signup_token" }
    };

    
    let order;
    try {
        order = await razorpay.orders.create(options);
    } catch(err) {
        if (process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_')) {
            console.warn("Razorpay error on test key, falling back to simulated mode. Error:", err.error?.description);
            const mockOrderId = `mock_ord_${Date.now()}`;
            return res.json({
              success: true,
              isSimulated: true,
              data: { id: mockOrderId, amount: options.amount, currency: options.currency },
              key_id: "rzp_test_placeholder"
            });
        } else {
            throw err;
        }
    }

    project.signupTokenPayment.razorpayOrderId = order.id;
    await project.save();

    res.json({
      success: true,
      data: order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Create Token Order Error:", error);
    res.status(500).json({ success: false, message: error.error?.description || error.message || "Failed to create order" });
  }
};

// Verify Platform Token Payment
export const verifyTokenPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, projectId } = req.body;
    const project = await ProjectOrder.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check for simulated bypass
    const isSimulated = razorpay_signature === "simulated_signature" || 
                        process.env.RAZORPAY_KEY_ID === "rzp_test_placeholder" || 
                        !process.env.RAZORPAY_KEY_ID;

    let verified = false;
    if (isSimulated) {
      verified = true;
    } else {
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");
      if (razorpay_signature === expectedSign) {
        verified = true;
      }
    }

    if (verified) {
      project.signupTokenPayment.status = "paid";
      project.signupTokenPayment.razorpayPaymentId = razorpay_payment_id || "mock_pay_id";
      project.signupTokenPayment.razorpaySignature = razorpay_signature || "mock_sig";
      project.signupTokenPayment.paidAt = new Date();
      project.paymentStatus = "paid";
      await project.save();

      // Create notification for assigned EPC
      if (project.assignedEPCId) {
        try {
          const { default: Notification } = await import("../models/Notification.js");
          await Notification.create({
            role: "EpcPartner",
            recipientId: project.assignedEPCId,
            title: "Token Paid - Start Government Registration",
            message: `Platform sign-up token payment has been completed by customer ${project.customerName || "Customer"} for order #${project.orderNumber}. Please proceed with government registration.`,
            projectId: project._id
          });
        } catch (notifErr) {
          console.error("Error creating token notification:", notifErr);
        }
      }

      res.json({ success: true, message: "Token payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verify Token Payment Error:", error);
    res.status(500).json({ success: false, message: error.error?.description || error.message || "Failed to create order" });
  }
};

// ── CUSTOMER MILESTONE STAGE PAYMENTS ──

// Create Razorpay Order for a Payment Stage
export const createStageOrder = async (req, res) => {
  try {
    const { projectId, stage } = req.body; // stage: stageKey identifier e.g. "stage1"

    const project = await ProjectOrder.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const stageIndex = project.stagePayments?.findIndex(s => s.stageKey === stage);
    if (stageIndex === -1 || stageIndex === undefined) {
      return res.status(400).json({ success: false, message: `Stage ${stage} details not initialized` });
    }

    const stageData = project.stagePayments[stageIndex];
    if (stageData.status === "paid") {
      return res.json({ success: true, alreadyPaid: true });
    }

    const stageAmount = stageData.amount || 0;
    if (stageAmount <= 0) {
      // Auto-approve if amount is 0
      project.stagePayments[stageIndex].status = "paid";
      project.stagePayments[stageIndex].paidAt = new Date();
      project.paymentBlockActive = false;
      project.activePaymentStage = "";
      await project.save();
      return res.json({ success: true, alreadyPaid: true });
    }

    const currency = (project.country === "australia" || project.country === "au") ? "AUD" : "INR";

    // Handle mock keys
    if (process.env.RAZORPAY_KEY_ID === "rzp_test_placeholder" || !process.env.RAZORPAY_KEY_ID) {
      const mockOrderId = `mock_${stage}_ord_${Date.now()}`;
      project.stagePayments[stageIndex].razorpayOrderId = mockOrderId;
      await project.save();
      return res.json({
        success: true,
        isSimulated: true,
        data: { id: mockOrderId, amount: stageAmount * 100, currency },
        key_id: "rzp_test_placeholder"
      });
    }

    const options = {
      amount: Math.round(stageAmount * 100),
      currency,
      receipt: `${stage}_rcpt_${project.orderNumber || project._id}`,
      notes: { projectId: project._id.toString(), type: "stage_payment", stage }
    };

    
    let order;
    try {
        order = await razorpay.orders.create(options);
    } catch(err) {
        if (process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_')) {
            console.warn("Razorpay error on test key, falling back to simulated mode. Error:", err.error?.description);
            const mockOrderId = `mock_ord_${Date.now()}`;
            return res.json({
              success: true,
              isSimulated: true,
              data: { id: mockOrderId, amount: options.amount, currency: options.currency },
              key_id: "rzp_test_placeholder"
            });
        } else {
            throw err;
        }
    }

    project.stagePayments[stageIndex].razorpayOrderId = order.id;
    await project.save();

    res.json({
      success: true,
      data: order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Create Stage Order Error:", error);
    res.status(500).json({ success: false, message: error.error?.description || error.message || "Failed to create order" });
  }
};

// Verify Stage Payment
export const verifyStagePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, projectId, stage } = req.body;

    const project = await ProjectOrder.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const stageIndex = project.stagePayments?.findIndex(s => s.stageKey === stage);
    if (stageIndex === -1 || stageIndex === undefined) {
      return res.status(400).json({ success: false, message: `Stage ${stage} details not found` });
    }

    // Check for simulated bypass
    const isSimulated = razorpay_signature === "simulated_signature" || 
                        process.env.RAZORPAY_KEY_ID === "rzp_test_placeholder" || 
                        !process.env.RAZORPAY_KEY_ID;

    let verified = false;
    if (isSimulated) {
      verified = true;
    } else {
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");
      if (razorpay_signature === expectedSign) {
        verified = true;
      }
    }

    if (verified) {
      project.stagePayments[stageIndex].status = "paid";
      project.stagePayments[stageIndex].razorpayPaymentId = razorpay_payment_id || "mock_pay_id";
      project.stagePayments[stageIndex].razorpaySignature = razorpay_signature || "mock_sig";
      project.stagePayments[stageIndex].paidAt = new Date();

      // Clear the blocking payment banner
      project.paymentBlockActive = false;
      project.activePaymentStage = "";
      
      await project.save();

      // Create notification for assigned EPC
      if (project.assignedEPCId) {
        try {
          const { default: Notification } = await import("../models/Notification.js");
          await Notification.create({
            role: "EpcPartner",
            recipientId: project.assignedEPCId,
            title: `Milestone Payment Completed: ${project.stagePayments[stageIndex].label}`,
            message: `Milestone payment for ${project.stagePayments[stageIndex].label} (${project.stagePayments[stageIndex].value}%) has been completed by customer ${project.customerName || "Customer"} for order #${project.orderNumber}.`,
            projectId: project._id
          });
        } catch (notifErr) {
          console.error("Error creating stage payment notification:", notifErr);
        }
      }

      res.json({ success: true, message: "Stage payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verify Stage Payment Error:", error);
    res.status(500).json({ success: false, message: error.error?.description || error.message || "Failed to create order" });
  }
};
