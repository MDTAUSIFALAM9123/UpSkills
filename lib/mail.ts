import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: `"UpSkills" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'OTP Code',
    html: `
      <h2>🔐 Password Reset OTP</h2>
      <p>Your OTP is:</p>
      <h1 style="color:blue">${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  });
};
