import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${process.env.NEXT_PUBLIC_URL}/api/auth/verify?token=${token}`;
  
  await transporter.sendMail({
    from: `"Verdirra" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your Verdirra account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0f172a; color: white; padding: 30px; border-radius: 16px;">
        <h1 style="color: #10b981; text-align: center;">🌱 Verdirra</h1>
        <h2 style="text-align: center;">Verify Your Email</h2>
        <p style="color: #94a3b8; text-align: center;">Click the button below to verify your account</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: linear-gradient(to right, #059669, #0891b2); color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">
            ✅ Verify Email
          </a>
        </div>
        <p style="color: #64748b; text-align: center; font-size: 12px;">Link expires in 24 hours</p>
      </div>
    `,
  });
};