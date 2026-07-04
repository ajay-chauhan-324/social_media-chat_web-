import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let transporter = null;

if (env.smtp.enabled) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
  logger.success('SMTP transport configured');
} else {
  logger.warn('SMTP not configured — emails will be logged to console (mock mode)');
}

/**
 * Send an email. When SMTP is unconfigured we log the message (and any action
 * link) so the dev flow still works end-to-end without a mail provider.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    logger.info(`📧 [MOCK EMAIL] to=${to} | subject="${subject}"`);
    if (text) logger.info(`   ${text}`);
    return { mocked: true };
  }
  const info = await transporter.sendMail({ from: env.smtp.from, to, subject, html, text });
  logger.info(`Email sent to ${to} (id=${info.messageId})`);
  return info;
};

const wrap = (title, body) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
    <h1 style="color:#2563EB;font-size:22px;margin:0 0 8px;">ArtROOT Chat</h1>
    <h2 style="color:#0f172a;font-size:18px;margin:0 0 16px;">${title}</h2>
    <div style="color:#334155;font-size:15px;line-height:1.6;">${body}</div>
    <p style="color:#94a3b8;font-size:12px;margin-top:32px;">Connect • Create • Collaborate • Powered by AI</p>
  </div>`;

const button = (label, url) =>
  `<a href="${url}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2563EB;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;">${label}</a>`;

export const sendVerificationEmail = (user, token) => {
  const url = `${env.clientUrl}/verify-email?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Verify your ArtROOT Chat account',
    text: `Verify your account: ${url}`,
    html: wrap(
      `Welcome, ${user.name}! 👋`,
      `<p>Confirm your email to unlock everything ArtROOT Chat has to offer.</p>${button('Verify Email', url)}<p style="font-size:13px;color:#64748b;">This link expires in 24 hours.</p>`
    ),
  });
};

export const sendPasswordResetEmail = (user, token) => {
  const url = `${env.clientUrl}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Reset your ArtROOT Chat password',
    text: `Reset your password: ${url}`,
    html: wrap(
      'Password reset requested',
      `<p>Click below to choose a new password. If you didn't request this, you can safely ignore this email.</p>${button('Reset Password', url)}<p style="font-size:13px;color:#64748b;">This link expires in 1 hour.</p>`
    ),
  });
};
