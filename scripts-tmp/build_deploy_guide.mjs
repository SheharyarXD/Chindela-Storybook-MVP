import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('docs/deployment-guide');
const HTML_PATH = path.join(OUT_DIR, 'deployment_guide.html');
const TODAY = 'July 15, 2026';

function service({ icon, title, sub, why, what, pricing, pricingTier, link, linkLabel, provide }) {
  return `
  <div class="service">
    <div class="service-head">
      <div class="service-icon">${icon}</div>
      <div><h3>${title}</h3><p class="service-sub">${sub}</p></div>
    </div>
    <div class="service-body">
      <div class="service-grid">
        <div><h4>Why It's Needed</h4><p>${why}</p></div>
        <div><h4>What It's Used For</h4><p>${what}</p></div>
      </div>
      <div class="service-footer">
        <span class="pill ${pricingTier === 'Free' ? 'pill-free' : 'pill-paid'}">${pricing}</span>
        <a class="signup-link" href="${link}">${linkLabel || link} ↗</a>
      </div>
      ${provide ? `<div class="provide-box"><h4>What To Send Me After Creating This Account</h4><ul>${provide.map(x => `<li>${x}</li>`).join('')}</ul></div>` : ''}
    </div>
  </div>`;
}

function checklistItem(text, owner) {
  const ownerLabel = owner === 'client' ? "Your action" : "I'll handle this";
  const ownerClass = owner === 'client' ? 't-who-client' : 't-who-dev';
  return `
  <li>
    <div class="box"></div>
    <div>
      <div class="step-text">${text}</div>
      <span class="t-who ${ownerClass}">${ownerLabel}</span>
    </div>
  </li>`;
}

function timelineStep(num, title, body, who) {
  const label = who === 'client' ? 'You' : 'Me (Sameer)';
  const cls = who === 'client' ? 't-who-client' : 't-who-dev';
  return `
  <li>
    <div class="t-num">${num}</div>
    <div class="t-body">
      <h4>${title}</h4>
      <p>${body}</p>
      <span class="t-who ${cls}">${label}</span>
    </div>
  </li>`;
}

const toc = [
  ['sec-1', '1. Introduction'],
  ['sec-2', '2. Accounts You Need To Create'],
  ['sec-3', '3. Stripe: One Final Step'],
  ['sec-4', '4. Gemini AI: Nothing Needed'],
  ['sec-5', '5. Deployment Checklist'],
  ['sec-6', '6. What Happens Next'],
  ['sec-7', '7. Information I\'ll Need From You'],
];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Chindela — Deployment Readiness Guide</title>
<style>
${fs.readFileSync(path.resolve('scripts-tmp/guide_style.css'), 'utf8')}
${fs.readFileSync(path.resolve('scripts-tmp/deploy_guide_style.css'), 'utf8')}
</style>
</head>
<body>

<!-- ================= COVER ================= -->
<section class="cover">
  <div class="cover-badge">Pre-Launch Preparation</div>
  <div class="cover-logo">📖 Chindela</div>
  <h1 class="cover-title">Deployment<br/>Readiness Guide</h1>
  <p class="cover-subtitle">A simple, step-by-step guide to what's needed before we go live</p>
  <div class="cover-meta">
    <div><span>Project Name</span><strong>Chindela Interactive Storybook Platform</strong></div>
    <div><span>Prepared For</span><strong>MJ CIC</strong></div>
    <div><span>Prepared By</span><strong>Sameer</strong></div>
    <div><span>Date</span><strong>${TODAY}</strong></div>
  </div>
  <div class="cover-footer">Confidential — Prepared exclusively for MJ CIC</div>
</section>

<!-- ================= TOC ================= -->
<section class="toc-page">
  <h2 class="toc-heading">Table of Contents</h2>
  <ol class="toc-list">
    ${toc.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join('\n    ')}
  </ol>
</section>

<!-- ================= SECTION 1 ================= -->
<section class="section" id="sec-1">
  <div class="section-head"><span class="section-num">1</span><h2>Introduction</h2></div>

  <p>Great news — the Chindela Interactive Storybook Platform is almost ready to go live. Everything you've seen
  and tested has been built and is working.</p>

  <p>What's left is not about building anything new. It's simply about connecting the platform to a small number
  of outside services that will keep it running smoothly for real families — things like secure file storage,
  email delivery, and web hosting.</p>

  <p>These services need to be set up in <strong>your organisation's own name</strong>, so that MJ CIC owns and
  controls its own data, its own domain, and its own accounts going forward. This is completely standard for any
  modern website and is simply good practice — it means everything belongs to you, not to any third party.</p>

  <div class="callout">
    <strong>To be clear about who does what:</strong> your only job is to create a short list of accounts and
    share some resulting details with me securely. I will take care of every technical step — connecting each
    service, configuring it correctly, testing it thoroughly, and deploying the live website. You do not need any
    technical knowledge to complete your part.
  </div>

  <p>This guide walks through exactly what to do, in plain language, with no technical background required.</p>
</section>

<!-- ================= SECTION 2 ================= -->
<section class="section" id="sec-2">
  <div class="section-head"><span class="section-num">2</span><h2>Accounts You Need To Create</h2></div>
  <p>Below is every account needed before launch. For each one, you'll find why it's needed, roughly what it
  costs, a link to sign up, and exactly what to send me afterwards.</p>

  ${service({
    icon: '🗄️', title: 'AWS (Amazon S3 Storage)', sub: 'Secure cloud storage for all files',
    why: 'Chindela stores every storybook image, audio recording, video and document your team uploads. This needs a secure, reliable place to live outside of the website itself.',
    what: 'Amazon S3 (Simple Storage Service) is used to store and safely deliver every media file used across the platform — story illustrations, character images, narration audio, and more.',
    pricing: 'Free to start', pricingTier: 'Free',
    link: 'https://aws.amazon.com', linkLabel: 'aws.amazon.com',
    provide: ['Nothing yet — once your account is created, just let me know and I\'ll take it from there.'],
  })}

  ${service({
    icon: '✉️', title: 'Resend', sub: 'Delivers account and notification emails',
    why: 'Chindela needs to send emails to parents — welcome messages, password resets, and payment receipts. Resend is a reliable, modern email delivery service that ensures these emails actually reach the inbox.',
    what: 'Every automatic email the platform sends to a parent (such as "reset your password" or "your subscription is active") is delivered through Resend.',
    pricing: 'Free to start', pricingTier: 'Free',
    link: 'https://resend.com', linkLabel: 'resend.com',
    provide: ['Nothing yet — once your account is created, just let me know and I\'ll take it from there.'],
  })}

  ${service({
    icon: '🌐', title: 'Production Hosting', sub: 'Where the live website runs, 24 hours a day',
    why: 'A website needs a "home" on the internet that is always switched on. This is called hosting.',
    what: 'We recommend <strong>Railway</strong>, a simple, modern hosting provider that is well-suited to how Chindela is built, and can conveniently host both the website and its database in one place. (Vercel is another well-known option, but is generally better suited to a different style of website — Railway is the better fit here.)',
    pricing: 'Low monthly cost', pricingTier: 'Paid',
    link: 'https://railway.app', linkLabel: 'railway.app',
    provide: ['Nothing yet — once your account is created, just let me know and I\'ll take it from there.'],
  })}

  ${service({
    icon: '🗃️', title: 'Production MySQL Database', sub: 'Where all real family and story data will live',
    why: 'Every family, child, story, and diary entry needs to be stored permanently and securely once the platform goes live for real users.',
    what: 'A production database is simply a more permanent, secure version of the database used during development. If you set up hosting with Railway as recommended above, the database can live there too, in the very same account.',
    pricing: 'Low monthly cost', pricingTier: 'Paid',
    link: 'https://railway.app', linkLabel: 'railway.app (or PlanetScale: planetscale.com)',
    provide: ['Nothing yet — once your account is created, just let me know and I\'ll take it from there.'],
  })}

  ${service({
    icon: '🌍', title: 'Domain Name', sub: 'Your website\'s address, e.g. www.chindela.org',
    why: 'Families need a simple, memorable web address to find and trust the platform, rather than a long technical link.',
    what: 'The domain name you choose will become the official public address for the Chindela website.',
    pricing: 'Roughly £10–£20 per year', pricingTier: 'Paid',
    link: 'https://www.namecheap.com', linkLabel: 'namecheap.com (or godaddy.com)',
    provide: ['Skip this step entirely if MJ CIC already owns a domain name you\'d like to use.'],
  })}

  <p class="callout">All prices above are approximate and based on typical usage for a platform of this size —
  actual costs depend on your usage and any offers available at the time of sign-up.</p>
</section>

<!-- ================= SECTION 3 ================= -->
<section class="section" id="sec-3">
  <div class="section-head"><span class="section-num">3</span><h2>Stripe: One Final Step</h2></div>

  <p>Good news — Stripe, the service that processes subscription payments, is already fully set up. The necessary
  Stripe keys have already been received and connected to the platform, so no new Stripe account or setup is
  needed from you here.</p>

  <p>There is just <strong>one small remaining step</strong>, and it can only be done once the website has an
  official, live web address (which happens during deployment). It's called a <strong>webhook secret</strong> —
  in simple terms, it's a secure code that lets Stripe safely notify the website the moment a real payment is
  successful.</p>

  <h3>How This Will Be Done</h3>
  <ol class="steps-list">
    <li>Once the website is live at its permanent address, I will open the Stripe Dashboard.</li>
    <li>I'll add the website's new address as an official "endpoint" — the place Stripe should send payment updates to.</li>
    <li>Stripe will then automatically generate a new, secure webhook secret for that address.</li>
    <li>I'll securely connect that secret to the live website, completing the payment setup.</li>
  </ol>
  <p class="callout">This step is quick, low-risk, and fully handled as part of deployment — it's mentioned here
  simply so you understand what it is if you see it referenced later.</p>
</section>

<!-- ================= SECTION 4 ================= -->
<section class="section" id="sec-4">
  <div class="section-head"><span class="section-num">4</span><h2>Gemini AI: Nothing Needed</h2></div>
  <p>Chindela's AI Tutor feature is powered by Google Gemini. The Gemini API key has already been provided and
  fully integrated into the platform.</p>
  <div class="callout">
    <strong>No further action is required from you for this.</strong> It's included here only so this guide gives
    you a complete picture of everything the platform depends on.
  </div>
</section>

<!-- ================= SECTION 5 ================= -->
<section class="section" id="sec-5">
  <div class="section-head"><span class="section-num">5</span><h2>Deployment Checklist</h2></div>
  <p>Here is the complete path to launch, in order. Each step shows whether it's something you'll do, or
  something I'll take care of.</p>

  <ul class="deploy-checklist">
    ${checklistItem('Create AWS account', 'client')}
    ${checklistItem('Create S3 bucket', 'dev')}
    ${checklistItem('Create Resend account', 'client')}
    ${checklistItem('Verify email domain', 'dev')}
    ${checklistItem('Create production database', 'dev')}
    ${checklistItem('Purchase / connect domain (if needed)', 'client')}
    ${checklistItem('Deploy website', 'dev')}
    ${checklistItem('Generate Stripe webhook', 'dev')}
    ${checklistItem('Final testing', 'dev')}
    ${checklistItem('Launch', 'dev')}
  </ul>
</section>

<!-- ================= SECTION 6 ================= -->
<section class="section" id="sec-6">
  <div class="section-head"><span class="section-num">6</span><h2>What Happens Next</h2></div>
  <p>Here's the simple, step-by-step journey from today to launch day:</p>

  <ul class="timeline">
    ${timelineStep(1, 'You create the required accounts', 'Using the links and guidance in Section 2, you set up each account under MJ CIC\'s own name. This usually takes well under an hour in total.', 'client')}
    ${timelineStep(2, 'You share the requested details with me, securely', 'Once each account is created, you send me the specific details listed in Section 7 — nothing more, nothing technical to figure out.', 'client')}
    ${timelineStep(3, 'I configure every service', 'I connect each account to the platform, set everything up correctly, and prepare the live environment.', 'dev')}
    ${timelineStep(4, 'Full production testing', 'I thoroughly test every part of the platform in its real, live setup — logins, payments, emails, storybooks and the AI tutor — to confirm everything works exactly as expected.', 'dev')}
    ${timelineStep(5, 'Website is deployed', 'The platform goes live at your new web address.', 'dev')}
    ${timelineStep(6, 'Final review', 'We do one last walkthrough together before opening the doors to real families.', 'dev')}
    ${timelineStep(7, 'Public launch 🎉', 'Chindela officially goes live for families to register, subscribe, and start reading.', 'dev')}
  </ul>
</section>

<!-- ================= SECTION 7 ================= -->
<section class="section" id="sec-7">
  <div class="section-head"><span class="section-num">7</span><h2>Information I'll Need From You</h2></div>
  <p>To keep things simple, here is the complete — and only — list of information I'll need from you. Anything
  not listed here has already been taken care of.</p>

  <table class="cred-table">
    <thead><tr><th>Item</th><th>Where To Find It</th></tr></thead>
    <tbody>
      <tr><td class="item">AWS Access Key ID</td><td>Shown in your AWS account after creating a security key</td></tr>
      <tr><td class="item">AWS Secret Access Key</td><td>Shown alongside the Access Key ID (shown only once — I'll guide you)</td></tr>
      <tr><td class="item">AWS Region</td><td>Shown in your AWS account (e.g. "eu-west-2")</td></tr>
      <tr><td class="item">AWS S3 Bucket Name</td><td>I will create this and confirm the name with you</td></tr>
      <tr><td class="item">Resend API Key</td><td>Shown in your Resend account dashboard</td></tr>
      <tr><td class="item">Verified Sender Email / Domain</td><td>The email address or domain you'd like emails sent from</td></tr>
      <tr><td class="item">Production Hosting Details</td><td>Login access or an invite to your hosting account</td></tr>
      <tr><td class="item">Production Database Connection</td><td>Provided automatically once the database is created</td></tr>
      <tr><td class="item">Production Domain</td><td>The web address you'd like families to visit</td></tr>
      <tr><td class="item">Stripe Webhook Secret</td><td class="badge-after">Generated automatically after deployment — no action needed from you</td></tr>
    </tbody>
  </table>

  <p class="callout">That's the complete list. Nothing here requires technical knowledge — for most items, you're
  simply copying a code or a name from a webpage and sending it to me securely (for example, by a password
  manager's sharing feature, or a private message rather than plain email, where possible).</p>
</section>

<!-- ================= FINAL CTA ================= -->
<section class="cta-page">
  <div class="cta-emoji">🚀</div>
  <h1 class="cta-title">You're Almost Ready to Launch!</h1>
  <p class="cta-sub">The platform is built, tested, and waiting. All that stands between today and launch day is
  a short list of accounts — and I'll be with you every step of the way.</p>
  <div class="cta-list">
    <ul>
      <li>✅ Platform development — complete</li>
      <li>✅ Stripe payments — connected</li>
      <li>✅ Gemini AI tutor — connected</li>
      <li>⬜ Accounts created by MJ CIC</li>
      <li>⬜ Final configuration &amp; testing</li>
      <li>⬜ Public launch</li>
    </ul>
  </div>
  <p class="cta-footer">Questions at any point? Just reach out — happy to walk through any of these steps together.</p>
</section>

</body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(HTML_PATH, html, 'utf8');
console.log('Wrote', HTML_PATH, html.length, 'bytes');
