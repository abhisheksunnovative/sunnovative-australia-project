import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const sendOtpEmail = async (toEmail, otp) => {
  if (!toEmail) return;

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'EmergeSun Customer Portal', email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email: toEmail }],
        subject: `Your Login OTP for EmergeSun Solar Portal: ${otp}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a; text-align: center;">Welcome to EmergeSun!</h2>
            <p style="color: #475569; text-align: center; margin-bottom: 30px;">Use the following OTP to log in to your Customer Portal.</p>
            
            <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #eab308;">${otp}</span>
            </div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
            
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              This is an automated message from EmergeSun.
            </p>
          </div>
        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 15000,
      }
    );
    console.log(`Email OTP sent to ${toEmail} via Brevo API`);
    return true;
  } catch (err) {
    console.error('[EMAIL OTP FAILED]', err.response?.data || err.message);
    return false;
  }
};
