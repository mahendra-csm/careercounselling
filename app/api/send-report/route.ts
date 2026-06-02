import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { renderReportPdf } from '@/lib/report-pdf';

/**
 * Renders the student's Career Discovery Report to a PDF and emails it as an
 * attachment from your mailbox over SMTP (e.g. Hostinger) to the recipient.
 *
 * Config (set in .env.local locally, and in the hosting env for production):
 *   SMTP_HOST          – e.g. smtp.hostinger.com   (required)
 *   SMTP_PORT          – 465 (SSL) or 587 (TLS). Defaults to 465.
 *   SMTP_USER          – full mailbox address, e.g. support@onegrasp.com (required)
 *   SMTP_PASS          – mailbox password (required)
 *   SMTP_SECURE        – "true"/"false". Defaults to true when port is 465.
 *   REPORT_FROM_EMAIL  – optional, defaults to "OneGrasp <SMTP_USER>"
 *
 * Needs the Node.js runtime (nodemailer + headless Chrome). PDF rendering can
 * take a while on a cold start, so allow a longer duration.
 */
export const runtime = 'nodejs';
export const maxDuration = 60;

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT || 465);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;
const SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : PORT === 465;
const FROM = process.env.REPORT_FROM_EMAIL || (USER ? `OneGrasp <${USER}>` : '');

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
  const reportId = String(body.reportId ?? '').trim();
  const completion = body.completion != null ? String(body.completion) : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ ok: false, error: 'A valid recipient email is required.' }, { status: 400 });
  }
  if (!reportId) {
    return NextResponse.json({ ok: false, error: 'Missing report id.' }, { status: 400 });
  }
  if (!HOST || !USER || !PASS) {
    return NextResponse.json(
      { ok: false, error: 'Email sending is not configured yet (SMTP_HOST / SMTP_USER / SMTP_PASS are missing).' },
      { status: 503 }
    );
  }

  // Build the report URL on the same origin this request came from.
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const reportUrl = `${origin}/report/view?id=${encodeURIComponent(reportId)}`;

  // 1) Render the report to a PDF.
  let pdf: Buffer;
  try {
    pdf = await renderReportPdf(reportUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to render the report PDF.';
    return NextResponse.json({ ok: false, error: `Could not generate the report PDF: ${message}` }, { status: 500 });
  }

  // 2) Email it as an attachment.
  const greeting = name ? `Hi ${esc(name)},` : 'Hi,';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#16243B">
      <div style="background:linear-gradient(135deg,#2D7FF0,#16314C);padding:24px;border-radius:14px;color:#fff">
        <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8">OneGrasp</p>
        <h1 style="margin:6px 0 0;font-size:22px">Your Career Discovery Report</h1>
      </div>
      <div style="padding:22px 4px">
        <p>${greeting}</p>
        <p>Congratulations on completing your career assessment${completion ? ` (<b>${esc(completion)}%</b> answered)` : ''}. Your full personalised report is <b>attached as a PDF</b> to this email.</p>
        <p>Open it to explore your strengths, interests, top career domains and recommended next steps.</p>
        <p style="font-size:12px;color:#6F7E94;margin-top:18px">Questions? Reply to this email or reach us at support@onegrasp.com / +91 89777 60443.</p>
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
      replyTo: USER,
      subject: `Your OneGrasp Career Discovery Report${name ? `, ${name}` : ''}`,
      html,
      attachments: [
        {
          filename: `OneGrasp-Career-Report${name ? '-' + name.replace(/[^a-zA-Z0-9]+/g, '-') : ''}.pdf`,
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send the report email.';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
