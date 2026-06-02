/**
 * Generates the report PDF in the BROWSER (no server / Chromium needed) — this
 * keeps it free-plan friendly: the heavy rendering happens on the admin's
 * machine, and only the finished PDF is handed to a tiny email function.
 *
 * It loads the live report in a hidden same-origin iframe, then snapshots each
 * A4 page with html2canvas and assembles them into one A4 PDF with jsPDF.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function waitFor(test: () => boolean, timeoutMs: number, intervalMs = 200): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (test()) return resolve();
      if (Date.now() - start > timeoutMs) return reject(new Error('Timed out waiting for the report to render.'));
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

export async function generateReportPdfBlob(reportId: string): Promise<Blob> {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-10000px';
  iframe.style.top = '0';
  iframe.style.width = '860px';
  iframe.style.height = '1200px';
  iframe.style.border = '0';
  iframe.src = `/report/view?id=${encodeURIComponent(reportId)}`;
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      setTimeout(resolve, 10000);
    });
    const doc = iframe.contentWindow?.document;
    if (!doc) throw new Error('Could not access the report frame.');

    // The report renders asynchronously (loads from Firestore).
    await waitFor(() => doc.querySelectorAll('.a4-page').length > 0, 20000);
    // let fonts / SVGs settle
    try { await (doc as Document & { fonts?: { ready?: Promise<unknown> } }).fonts?.ready; } catch { /* noop */ }
    await new Promise((r) => setTimeout(r, 900));

    const pages = Array.from(doc.querySelectorAll('.a4-page')) as HTMLElement[];
    if (pages.length === 0) throw new Error('The report has no pages to export.');

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: pages[i].scrollWidth,
        windowHeight: pages[i].scrollHeight,
      });
      const img = canvas.toDataURL('image/jpeg', 0.9);
      if (i > 0) pdf.addPage();
      pdf.addImage(img, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }
    return pdf.output('blob');
  } finally {
    iframe.remove();
  }
}

/** Convert a Blob to a base64 string (without the data: prefix). */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
