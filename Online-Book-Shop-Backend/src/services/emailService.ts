/**
 * Email adapter.
 *
 * By default runs in "mock" mode: it logs the email to the console and returns
 * success, so the whole app works with no SMTP credentials. If real SMTP env
 * vars are present (SMTP_HOST etc.) it will lazy-load nodemailer and send for
 * real — drop-in upgrade with zero code changes elsewhere.
 */

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const isSmtpConfigured = () =>
  !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export const isEmailLive = isSmtpConfigured;

export const sendEmail = async (options: MailOptions): Promise<void> => {
  if (!isSmtpConfigured()) {
    // Mock mode — pretend to send.
    console.log('\n📧 [MOCK EMAIL] ------------------------------');
    console.log(`   To:      ${options.to}`);
    console.log(`   Subject: ${options.subject}`);
    console.log(`   Body:    ${options.text || stripHtml(options.html)}`);
    console.log('   (Set SMTP_HOST/SMTP_USER/SMTP_PASS in .env to send for real)');
    console.log('-------------------------------------------------\n');
    return;
  }

  // Real mode — lazy require so nodemailer is optional.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"BookShop" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text || stripHtml(options.html),
    html: options.html,
  });
};

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export const passwordResetEmail = (name: string, resetUrl: string) => ({
  subject: 'Reset your BookShop password',
  html: `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2>Password reset</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <p><a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Reset password</a></p>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>`,
});
