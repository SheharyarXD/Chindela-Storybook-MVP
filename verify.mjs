import { chromium } from 'playwright';
import fs from 'fs';

const outDir = 'C:\\Users\\XDGAMI~1\\AppData\\Local\\Temp\\claude\\e--Chindela-Storybook-MVP-app\\7392b191-3e82-40ad-8912-02e78de61d24\\scratchpad\\shots';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const consoleErrors = [];

async function shot(page, name) {
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  console.log('saved', name);
}

// Desktop landing page
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(`[desktop-home] ${msg.text()}`); });
  page.on('pageerror', (err) => consoleErrors.push(`[desktop-home pageerror] ${err.message}`));
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await shot(page, '01-home-desktop');

  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  console.log('BODY FONT:', bodyFont);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log('BODY BG:', bg);
  await ctx.close();
}

// Mobile landing page
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(`[mobile-home] ${msg.text()}`); });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await shot(page, '02-home-mobile');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log('MOBILE HORIZONTAL OVERFLOW:', overflow);
  await ctx.close();
}

// Login page + bad credentials -> toast
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(`[login] ${msg.text()}`); });
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await shot(page, '03-login-page');

  await page.fill('input[type="email"]', 'nonexistent-user@example.com');
  await page.fill('input[type="password"]', 'wrongpassword123456');
  await page.click('button[type="submit"], button:has-text("Sign in")');
  await page.waitForTimeout(1500);
  await shot(page, '04-login-toast-error');
}

// Register a fresh parent account to reach an authenticated dashboard
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(`[register] ${msg.text()}`); });
  page.on('pageerror', (err) => consoleErrors.push(`[register pageerror] ${err.message}`));
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.click('button:has-text("New parent? Create an account")');
  await page.waitForTimeout(300);
  const stamp = Date.now();
  await page.fill('input[placeholder="Your name"]', 'Verify Tester');
  await page.fill('input[type="email"]', `verify-tester-${stamp}@example.com`);
  await page.fill('input[type="password"]', 'ReallyStrongPassword123!');
  await page.click('button:has-text("Create account")');
  await page.waitForTimeout(2000);
  await shot(page, '05-after-register');
  console.log('URL after register:', page.url());

  if (page.url().includes('/dashboard')) {
    await shot(page, '06-dashboard-desktop');

    // Try opening avatar dropdown
    const avatarBtn = page.locator('nav button:has(img), nav button:has-text("Verify Tester")').last();
    if (await avatarBtn.count()) {
      await avatarBtn.click();
      await page.waitForTimeout(400);
      await shot(page, '07-dashboard-avatar-menu-open');
      await page.keyboard.press('Escape');
    }

    // Mobile nav check
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await shot(page, '08-dashboard-mobile');
    const hamburger = page.locator('nav button:has(svg)').last();
    await page.locator('nav').getByRole('button').last().click().catch(() => {});
    await page.waitForTimeout(500);
    await shot(page, '09-dashboard-mobile-menu-open');
  }
  await ctx.close();
}

fs.writeFileSync(`${outDir}/console-errors.txt`, consoleErrors.join('\n') || '(none)');
console.log('CONSOLE ERRORS:\n', consoleErrors.join('\n') || '(none)');

await browser.close();
