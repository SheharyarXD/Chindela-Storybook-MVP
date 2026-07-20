import { chromium } from 'playwright';
import path from 'node:path';

const htmlPath = path.resolve('docs/deployment-guide/deployment_guide.html');
const outPath = path.resolve('Chindela_Deployment_Readiness_Guide.pdf');

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
await page.goto('file:///' + htmlPath.split('\\').join('/'), { waitUntil: 'networkidle' });

await page.pdf({
  path: outPath,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `
    <div style="font-size:8px; color:#9ca3af; width:100%; text-align:center; font-family: 'Segoe UI', sans-serif; padding-top:2px;">
      Chindela Deployment Readiness Guide — Confidential &nbsp;|&nbsp; Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>`,
  margin: { top: '10mm', bottom: '14mm', left: '16mm', right: '16mm' },
});

await browser.close();
console.log('Wrote', outPath);
