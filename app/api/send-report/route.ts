import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Emails the student's Career Discovery Report (as a secure link) from your
 * mailbox over SMTP (e.g. Hostinger) to the chosen recipient, and BCCs your
 * own mailbox so the OneGrasp team captures the lead.
 *
 * Config (set in .env.local / hosting env):
 *   SMTP_HOST          – e.g. smtp.hostinger.com   (required)
 *   SMTP_PORT          – 465 (SSL) or 587 (TLS). Defaults to 465.
 *   SMTP_USER          – full mailbox address, e.g. support@onegrasp.com (required)
 *   SMTP_PASS          – mailbox password (required)
 *   SMTP_SECURE        – "true"/"false". Defaults to true when port is 465.
 *   REPORT_FROM_EMAIL  – optional, defaults to "OneGrasp <SMTP_USER>"
 *   REPORT_BCC_EMAIL   – optional, defaults to SMTP_USER
 *
 * nodemailer needs the Node.js runtime (not edge).
 */
export const runtime = 'nodejs';

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT || 465);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;
const SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : PORT === 465;
const FROM = process.env.REPORT_FROM_EMAIL || (USER ? `OneGrasp <${USER}>` : '');
const BCC = process.env.REPORT_BCC_EMAIL || USER || undefined;

function esc(s: string) {
  return String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const to = String(body.to ?? '').trim();
  const name = String(body.name ?? '').trim();
  const reportUrl = String(body.reportUrl ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const klass = String(body.class ?? '').trim();
  const rating = body.rating != null ? String(body.rating) : '';
  const completion = body.completion != null ? String(body.completion) : '';
  const email = String(body.email ?? '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ ok: false, error: 'A valid recipient email is required.' }, { status: 400 });
  }

  if (!HOST || !USER || !PASS) {
    return NextResponse.json(
      { ok: false, error: 'Email sending is not configured yet (SMTP_HOST / SMTP_USER / SMTP_PASS are missing).' },
      { status: 503 }
    );
  }

  const greeting = name ? `Hi ${esc(name)},` : 'Hi,';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#16243B">
      <div style="background:linear-gradient(135deg,#2D7FF0,#16314C);padding:24px;border-radius:14px;color:#fff">
        <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8">OneGrasp</p>
        <h1 style="margin:6px 0 0;font-size:22px">Your Career Discovery Report is ready</h1>
      </div>
      <div style="padding:22px 4px">
        <p>${greeting}</p>
        <p>Your personalised career assessment is complete${completion ? ` (<b>${esc(completion)}%</b> of the test answered)` : ''}. Open your full report below:</p>
        <p style="text-align:center;margin:24px 0">
          <a href="${esc(reportUrl)}" style="background:#2D7FF0;color:#fff;text-decoration:none;font-weight:bold;padding:12px 26px;border-radius:10px;display:inline-block">View your report</a>
        </p>
        <p style="font-size:12px;color:#6F7E94">Or copy this link:<br>${esc(reportUrl)}</p>
        <hr style="border:none;border-top:1px solid #E4EAF3;margin:18px 0">
        <p style="font-size:12px;color:#6F7E94">
          ${email ? `Email: ${esc(email)}<br>` : ''}${phone ? `Phone: ${esc(phone)}<br>` : ''}${klass ? `Class: ${esc(klass)}<br>` : ''}${rating ? `Self-rating: ${esc(rating)}/10` : ''}
        </p>
        <p style="font-size:12px;color:#6F7E94">Questions? Reply to this email or reach us at support@onegrasp.com / +91 89777 60443.</p>
      </div>
    </div>`;

  try {
    const transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: SECURE,
      auth: { user: USER, pass: PASS },
    });

    await transporter.sendMail({
      from: FROM,
      to,
      bcc: BCC,
      replyTo: USER,
      subject: `Your OneGrasp Career Discovery Report${name ? `, ${name}` : ''}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send the report email.';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
