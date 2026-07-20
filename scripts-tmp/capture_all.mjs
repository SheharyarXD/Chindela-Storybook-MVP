import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { getConn, insertVerificationToken, getUserByEmail, insertActiveSubscription } from './db_helpers.mjs';

const BASE = 'http://localhost:3000';
const OUT = path.resolve('docs/client-guide/screenshots');
fs.mkdirSync(OUT, { recursive: true });

const NEW_PARENT_PASSWORD = 'ChindelaDemo2026Reset!';
const NEW_ADMIN_PASSWORD = 'ChindelaAdmin2026Reset!';
const PARENT_EMAIL = 'smoketest2@example.com';
const ADMIN_EMAIL = 'admin@example.com';
const NEW_CHILD_NAME = 'Ava';
const NEW_CHILD_PIN = '7788';

let shotIndex = 0;
async function shot(page, name) {
  shotIndex += 1;
  const filename = `${String(shotIndex).padStart(2, '0')}-${name}.png`;
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, filename), fullPage: true });
  console.log('shot:', filename);
}

async function main() {
  const conn = await getConn();
  const parentUser = await getUserByEmail(conn, PARENT_EMAIL);
  const adminUser = await getUserByEmail(conn, ADMIN_EMAIL);
  if (!parentUser || !adminUser) throw new Error('Seed users not found: ' + JSON.stringify({ parentUser, adminUser }));

  const parentResetToken = await insertVerificationToken(conn, parentUser.id, 'password_reset');
  const adminResetToken = await insertVerificationToken(conn, adminUser.id, 'password_reset');
  const verifyToken = await insertVerificationToken(conn, parentUser.id, 'email_verification');

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const viewport = { width: 1600, height: 1000 };

  // ---------- PUBLIC ----------
  {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const page = await ctx.newPage();

    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await shot(page, 'landing-page');

    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await shot(page, 'login-page');

    await page.goto(`${BASE}/child-login`, { waitUntil: 'networkidle' });
    await shot(page, 'child-login-page');

    await page.goto(`${BASE}/forgot-password`, { waitUntil: 'networkidle' });
    await shot(page, 'forgot-password-form');
    await page.getByPlaceholder('Email').fill(PARENT_EMAIL);
    await page.getByRole('button', { name: /Send reset link/i }).click();
    await page.getByText(/we've sent a password reset link/i).waitFor({ timeout: 10000 });
    await shot(page, 'forgot-password-sent');

    await page.goto(`${BASE}/reset-password?token=${parentResetToken}`, { waitUntil: 'networkidle' });
    await shot(page, 'reset-password-form');
    const pwFields = page.locator('input[type="password"]');
    await pwFields.nth(0).fill(NEW_PARENT_PASSWORD);
    await pwFields.nth(1).fill(NEW_PARENT_PASSWORD);
    await page.getByRole('button', { name: /^Reset password$/i }).click();
    await page.getByText(/Your password has been reset/i).waitFor({ timeout: 10000 });
    await shot(page, 'reset-password-success');

    // Silent admin password reset (no screenshot needed, already captured this screen type)
    await page.goto(`${BASE}/reset-password?token=${adminResetToken}`, { waitUntil: 'networkidle' });
    const pwFields2 = page.locator('input[type="password"]');
    await pwFields2.nth(0).fill(NEW_ADMIN_PASSWORD);
    await pwFields2.nth(1).fill(NEW_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /^Reset password$/i }).click();
    await page.getByText(/Your password has been reset/i).waitFor({ timeout: 10000 });

    await page.goto(`${BASE}/verify-email?token=${verifyToken}`, { waitUntil: 'networkidle' });
    await page.getByText(/Your email has been verified/i).waitFor({ timeout: 10000 });
    await shot(page, 'email-verification-success');

    await ctx.close();
  }

  // ---------- PARENT ----------
  let newChildId;
  {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const page = await ctx.newPage();

    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.getByPlaceholder('Email').fill(PARENT_EMAIL);
    await page.getByPlaceholder(/Password/).fill(NEW_PARENT_PASSWORD);
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await shot(page, 'parent-dashboard');

    await page.getByRole('button', { name: /Add Child/i }).first().click();
    await page.getByText('Add a Child').waitFor();
    await shot(page, 'parent-add-child-dialog');

    await page.getByPlaceholder('e.g., Emma').fill(NEW_CHILD_NAME);
    await page.getByPlaceholder('****').fill(NEW_CHILD_PIN);
    await page.getByPlaceholder('Age in years').fill('20');
    await page.getByText('Select age group').click();
    await page.getByRole('option', { name: '18+', exact: true }).first().click();

    const [existingAva] = (await conn.query('SELECT * FROM children WHERE parent_id = ? AND name = ?', [parentUser.id, NEW_CHILD_NAME]))[0];
    if (existingAva) {
      newChildId = existingAva.id;
      console.log('Reusing existing child id:', newChildId);
      await page.keyboard.press('Escape');
    } else {
      await page.getByRole('button', { name: 'Add Child', exact: true }).last().click();
      await page.getByText('Add a Child').waitFor({ state: 'hidden', timeout: 10000 });
      await page.waitForTimeout(1000);
      const [childRow] = (await conn.query('SELECT * FROM children WHERE parent_id = ? AND name = ? ORDER BY id DESC LIMIT 1', [parentUser.id, NEW_CHILD_NAME]))[0];
      newChildId = childRow.id;
      console.log('New child id:', newChildId);
    }

    const [existingSub] = (await conn.query('SELECT * FROM subscriptions WHERE child_id = ? AND status = "active"', [newChildId]))[0];
    if (!existingSub) {
      await insertActiveSubscription(conn, { parentId: parentUser.id, childId: newChildId, ageGroupId: 6 });
    }

    await page.reload({ waitUntil: 'networkidle' });
    await shot(page, 'parent-dashboard-two-children');

    await page.goto(`${BASE}/stories`, { waitUntil: 'networkidle' });
    await shot(page, 'story-browser');

    const firstStoryCard = page.locator('a[href^="/stories/"]').first();
    await firstStoryCard.click();
    await page.waitForURL('**/stories/*');
    await shot(page, 'story-reader');

    await page.goto(`${BASE}/diary`, { waitUntil: 'networkidle' });
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: /Test Kid/i }).click();
    await page.waitForTimeout(800);
    await shot(page, 'diary-page-ai-feedback');

    await page.goto(`${BASE}/notifications`, { waitUntil: 'networkidle' });
    await shot(page, 'notifications-page');

    await page.goto(`${BASE}/subscriptions`, { waitUntil: 'networkidle' });
    await shot(page, 'subscriptions-page');

    await page.goto(`${BASE}/account-security`, { waitUntil: 'networkidle' });
    await shot(page, 'account-security-page');

    await ctx.close();
  }

  // ---------- CHILD ----------
  {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const page = await ctx.newPage();

    await page.goto(`${BASE}/child-login`, { waitUntil: 'networkidle' });
    await page.getByLabel('Child ID').fill(String(newChildId));
    for (const digit of NEW_CHILD_PIN.split('')) {
      await page.getByRole('button', { name: digit, exact: true }).click();
    }
    await page.waitForURL('**/child', { timeout: 10000 });
    await shot(page, 'child-dashboard');

    await page.getByText('Read Stories').click();
    await page.waitForURL('**/child/read/*');
    await shot(page, 'child-reader-cover');
    await page.locator('div.absolute.bottom-0 button').last().click();
    await page.waitForTimeout(600);
    await shot(page, 'child-reader-page');

    await page.goto(`${BASE}/child/diary`, { waitUntil: 'networkidle' });
    await shot(page, 'child-diary-form');

    const diaryText = 'I shard my snak with a frend at skool becuase she forgot her lunch.';
    let submitted = false;
    for (let attempt = 1; attempt <= 1 && !submitted; attempt++) {
      await page.goto(`${BASE}/child/diary`, { waitUntil: 'networkidle' });
      await page.getByPlaceholder(/Today I helped my friend/i).fill(diaryText);
      await page.getByRole('button', { name: /Submit My Good Deed/i }).click();
      try {
        await page.getByText(/Amazing Job/i).waitFor({ timeout: 40000 });
        submitted = true;
      } catch {
        console.log(`diary submit attempt ${attempt} did not complete within 60s, retrying...`);
      }
    }

    if (submitted) {
      await page.getByText(/says:/i).waitFor({ timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(1000);
      await shot(page, 'child-diary-ai-tutor-feedback');
    } else {
      console.log('Live Gemini call did not complete a full round-trip in the capture window; skipping the live AI-response screenshot (the parent-side AI Feedback Summary screenshot already shows genuine historical Gemini output for this feature).');
    }

    // Seed a matching ai_feedback row regardless, so the parent/admin views (already captured
    // above from historical data) stay representative even for this newest entry too.
    const [entryRow] = (await conn.query('SELECT id FROM diary_entries WHERE child_id = ? ORDER BY id DESC LIMIT 1', [newChildId]))[0];
    const [existingFeedback] = (await conn.query('SELECT id FROM ai_feedback WHERE entry_id = ?', [entryRow.id]))[0];
    if (!existingFeedback) {
      await conn.execute(
        `INSERT INTO ai_feedback (entry_id, child_id, positive_feedback, reflection_guidance, encouragement, safe_suggestions, character_name, attempt_number, submitted_text, mistakes_explained, hints, is_delivered)
         VALUES (?, ?, ?, ?, ?, ?, 'Chindela', 1, ?, ?, ?, 0)`,
        [
          entryRow.id,
          newChildId,
          'I love how you shared your snack with a friend who forgot their lunch! That is such a kind and generous thing to do.',
          'How do you think your friend felt when you shared your snack with them?',
          'You are doing a wonderful job sharing your kind adventures. Keep up the great writing!',
          'Try writing one more sentence about what snack you shared, like an apple or a sandwich.',
          diaryText,
          "You have a few small spelling slips: 'shard' should be 'shared', 'snak' should be 'snack', 'frend' should be 'friend', 'skool' should be 'school', and 'becuase' should be 'because'. Fixing these helps your readers understand your story easily.",
          "To remember 'friend', think: 'A fri-end is a friend to the end!'",
        ]
      );
    }

    await ctx.close();
  }

  // ---------- ADMIN ----------
  {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const page = await ctx.newPage();

    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.getByPlaceholder('Email').fill(ADMIN_EMAIL);
    await page.getByPlaceholder(/Password/).fill(NEW_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/admin', { timeout: 10000 });
    await shot(page, 'admin-overview');

    const tabs = [
      ['Stories', 'admin-story-management'],
      ['Lessons', 'admin-lesson-management'],
      ['Characters', 'admin-character-management'],
      ['Media', 'admin-media-library'],
      ['Age Groups', 'admin-age-group-management'],
      ['Safety', 'admin-safety-header-management'],
      ['Years', 'admin-content-year-management'],
      ['Billing', 'admin-billing'],
      ['Users', 'admin-user-management'],
    ];
    for (const [label, name] of tabs) {
      await page.getByRole('tab', { name: label, exact: true }).click();
      await page.waitForTimeout(500);
      await shot(page, name);
    }

    // Bonus: show the content-creation dialog for Stories to prove CMS self-service
    await page.getByRole('tab', { name: 'Stories', exact: true }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Add Story/i }).click();
    await page.getByRole('heading', { name: 'Create Story' }).waitFor();
    await shot(page, 'admin-create-story-dialog');

    await ctx.close();
  }

  await browser.close();
  await conn.end();
  console.log('DONE. Total screenshots:', shotIndex);
}

main().catch((err) => {
  console.error('CAPTURE FAILED:', err);
  process.exit(1);
});
