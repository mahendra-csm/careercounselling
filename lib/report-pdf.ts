import 'server-only';

/**
 * Renders the live report page to a PDF buffer using headless Chrome — so the
 * PDF looks exactly like the on-screen report.
 *
 * - Locally / on a normal Node host: uses full `puppeteer` (its bundled Chrome).
 * - On serverless (Vercel / Netlify / AWS Lambda): uses `puppeteer-core` +
 *   `@sparticuz/chromium` (a slim Chromium that fits in the function).
 */
export async function renderReportPdf(url: string): Promise<Buffer> {
  const isServerless = Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.AWS_EXECUTION_ENV ||
      process.env.NETLIFY ||
      process.env.VERCEL
  );

  let browser: import('puppeteer-core').Browser;

  if (isServerless) {
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteer = (await import('puppeteer-core')).default;
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1240, height: 1754 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    const puppeteer = (await import('puppeteer')).default;
    browser = (await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })) as unknown as import('puppeteer-core').Browser;
  }

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    // The report loads asynchronously (from Firestore) — wait for a page to render.
    await page.waitForSelector('.a4-page', { timeout: 30000 });
    try {
      await page.evaluateHandle('document.fonts.ready');
    } catch {
      /* fonts API not critical */
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      format: 'A4',
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
