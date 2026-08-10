import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Reuses the EXACT same Brevo credentials your OTP email flow already uses
// (BREVO_SMTP_LOGIN + BREVO_API_KEY as the SMTP password, BREVO_SENDER_EMAIL
// as the "from" address). If you already have a shared mailer/transporter
// util from the OTP flow (e.g. utils/sendEmail.js), it's cleaner to import
// and reuse that transporter directly instead of creating a second one here
// — just keep the sendLowBalanceAlert() function signature the same.

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_API_KEY,
  },
});

export const sendLowBalanceAlert = async ({ toEmail, epcName, totalCredits, lowBalanceAlertKW }) => {
  if (!toEmail) return;

  try {
    await transporter.sendMail({
      from: `"EmergeSun EPC Portal" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: toEmail,
      subject: `⚠️ Low Wallet Balance — ${totalCredits} KW remaining`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color:#d97706;">Wallet Balance Low</h2>
          <p>Hi ${epcName || 'Partner'},</p>
          <p>Your EmergeSun EPC wallet balance has dropped to
             <strong>${totalCredits} KW</strong>, which is at or below your
             alert threshold of ${lowBalanceAlertKW} KW.</p>
          <p>Recharge soon to keep accepting new project orders without interruption.</p>
          <a href="${process.env.EPC_CLIENT_URL || '#'}/epc/wallet"
             style="display:inline-block;margin-top:12px;padding:10px 20px;
                    background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
            Recharge Wallet
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
            This is an automated alert from EmergeSun EPC Portal.
          </p>
        </div>
      `,
    });
  } catch (err) {
    // Never let an email failure break the wallet transaction flow
    console.error('sendLowBalanceAlert error:', err.message);
  }
};