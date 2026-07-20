import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('docs/client-guide');
const HTML_PATH = path.join(OUT_DIR, 'client_guide.html');
const TODAY = 'July 15, 2026';

function esc(s) { return s; } // content is hand-authored, not user input

function shot(file, caption, wide = true) {
  return `
  <figure class="shot ${wide ? '' : 'shot-narrow'}">
    <div class="browser-chrome"><span></span><span></span><span></span></div>
    <img src="screenshots/${file}" alt="${caption}" />
    <figcaption>${caption}</figcaption>
  </figure>`;
}

function feature({ id, title, tag, shots, purpose, how, benefits, example }) {
  return `
  <div class="feature" id="${id}">
    <div class="feature-head">
      <span class="tag">${tag}</span>
      <h3>${title}</h3>
    </div>
    <div class="shots-row">${shots.join('')}</div>
    <div class="feature-grid">
      <div><h4>Purpose</h4><p>${purpose}</p></div>
      <div><h4>How It Works</h4><p>${how}</p></div>
      <div><h4>Benefits</h4><p>${benefits}</p></div>
      <div><h4>Example Usage</h4><p>${example}</p></div>
    </div>
  </div>`;
}

const toc = [
  ['sec-1', '1. Project Overview'],
  ['sec-2', '2. System Roles'],
  ['sec-3', '3. Complete Feature Walkthrough'],
  ['sec-4', '4. The AI Tutor, Powered by Google Gemini'],
  ['sec-5', '5. Admin Content Management System'],
  ['sec-6', '6. Media Library'],
  ['sec-7', '7. Subscriptions & Payments'],
  ['sec-8', '8. Security & Privacy'],
  ['sec-9', '9. Future Expansion'],
  ['sec-10', '10. Infrastructure Required Before Launch'],
  ['sec-11', '11. Current Development Status'],
  ['sec-12', '12. Next Steps'],
];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Chindela Interactive Storybook Platform — Client Guide</title>
<style>
${fs.readFileSync(path.resolve('scripts-tmp/guide_style.css'), 'utf8')}
</style>
</head>
<body>

<!-- ================= COVER ================= -->
<section class="cover">
  <div class="cover-badge">Interactive Storybook Platform</div>
  <div class="cover-logo">📖 Chindela</div>
  <h1 class="cover-title">Chindela Interactive<br/>Storybook Platform</h1>
  <p class="cover-subtitle">Client Product Guide &amp; Platform Handbook</p>
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
  <div class="section-head"><span class="section-num">1</span><h2>Project Overview</h2></div>

  <h3>What the Platform Does</h3>
  <p>Chindela is a subscription-based interactive storybook website for children. Parents create an account, add
  their children, and subscribe to unlock age-appropriate storybooks. Each story teaches a life lesson — kindness,
  courage, honesty — through a guided reading experience featuring a cast of friendly animal characters. After
  reading, children are encouraged to write a short "good deed" diary entry about something kind they did that day.
  An AI-powered tutor, built on Google's Gemini technology, reads what the child wrote and responds with warm,
  age-appropriate encouragement, gently points out any spelling or writing mistakes, and asks a thoughtful follow-up
  question to help the child reflect. Parents can review everything their child writes and every response the AI
  tutor gives, at any time.</p>

  <h3>Who Uses It</h3>
  <p>There are three types of people who use Chindela: <strong>parents</strong>, who manage their family's account,
  subscriptions and billing; <strong>children</strong>, who read stories and write their diary in a safe, simplified
  space designed just for them; and the <strong>administrator</strong> (you, or a member of your team), who manages
  every piece of content on the platform — stories, lessons, characters, pricing and more — without ever needing a
  developer.</p>

  <h3>Benefits</h3>
  <ul class="check-list">
    <li>A safe, screen-time-positive activity that combines storytelling with real character education.</li>
    <li>Personalised, encouraging feedback for every child, generated instantly by AI rather than requiring manual review.</li>
    <li>Parents stay fully informed of their child's activity and progress without any extra effort.</li>
    <li>All content — stories, lessons, images, audio, video — is managed by your team through a simple, visual dashboard.</li>
    <li>Built on a modern, secure, and widely-used technology stack (the same class of technology used by major consumer apps), so it is reliable and straightforward to maintain.</li>
  </ul>

  <h3>Future Scalability</h3>
  <p>The platform has been built from the ground up to grow with you. New stories, lessons, characters, age groups and
  entire years of content can be added at any time through the admin dashboard, with no limit on volume and no
  developer involvement required. Section 9 of this guide covers this in more detail.</p>
</section>

<!-- ================= SECTION 2 ================= -->
<section class="section" id="sec-2">
  <div class="section-head"><span class="section-num">2</span><h2>System Roles</h2></div>
  <p>Chindela is built around three distinct roles, each with its own dedicated, purpose-built experience.</p>

  <div class="role-grid">
    <div class="role-card role-admin">
      <div class="role-icon">🛡️</div>
      <h3>Administrator</h3>
      <p>Your team's control centre for the entire platform.</p>
      <ul>
        <li>Creates and edits stories, lessons and characters</li>
        <li>Uploads and manages all images, audio, video and documents</li>
        <li>Manages age groups, safety messages, and content years</li>
        <li>Oversees every family's subscription and billing status</li>
        <li>Views every registered parent and child account</li>
      </ul>
    </div>
    <div class="role-card role-parent">
      <div class="role-icon">👨‍👩‍👧</div>
      <h3>Parent</h3>
      <p>The account holder and guardian for one or more children.</p>
      <ul>
        <li>Registers, manages billing, and subscribes children to content</li>
        <li>Adds children to their family account with a secure PIN</li>
        <li>Browses the story library and reads stories alongside their child</li>
        <li>Reviews every diary entry and AI tutor response their child receives</li>
        <li>Manages notifications and account security settings</li>
      </ul>
    </div>
    <div class="role-card role-child">
      <div class="role-icon">🧒</div>
      <h3>Child</h3>
      <p>A simplified, playful, and safe space designed just for young readers.</p>
      <ul>
        <li>Logs in with a simple 4-digit PIN — no email or password needed</li>
        <li>Reads storybooks unlocked by their parent's subscription</li>
        <li>Writes a short daily diary entry about a good deed</li>
        <li>Receives instant, encouraging feedback from the AI tutor character</li>
        <li>Sees a friendly safety reminder on every screen</li>
      </ul>
    </div>
  </div>
</section>

<!-- ================= SECTION 3 ================= -->
<section class="section" id="sec-3">
  <div class="section-head"><span class="section-num">3</span><h2>Complete Feature Walkthrough</h2></div>
  <p>This section walks through every screen in the platform exactly as it looks today, captured directly from the
  live application.</p>

  <h3 class="subsection-heading">Getting Started</h3>
  ${feature({
    id: 'f-landing', title: 'Landing Page', tag: 'Public',
    shots: [shot('01-landing-page.png', 'The public landing page, introducing the platform to new visitors')],
    purpose: 'The first impression for new visitors — introduces the platform and explains its value in plain language.',
    how: 'A visitor arrives at the website and is greeted with a warm, colourful introduction to Chindela, a summary of what makes it valuable, and two clear buttons: one to get started as a parent, and one for children to log in.',
    benefits: 'Builds trust and clarity from the very first moment, and routes each visitor — parent or child — to the correct part of the platform immediately.',
    example: 'A parent hears about Chindela from a friend, visits the website, reads the "Why Chindela?" section, and clicks "Get Started" to create an account.',
  })}
  ${feature({
    id: 'f-login', title: 'Parent &amp; Administrator Login', tag: 'Public',
    shots: [shot('02-login-page.png', 'The sign-in and account creation screen')],
    purpose: 'A single, simple screen for parents and administrators to sign in, or for new parents to create an account.',
    how: 'Visitors enter their email and password to sign in, or switch to "Create an account" to register as a new parent in seconds.',
    benefits: 'One clean, familiar screen reduces confusion and gets people into the platform quickly.',
    example: 'A returning parent enters their email and password and is taken straight to their dashboard.',
  })}
  ${feature({
    id: 'f-child-login', title: 'Child Login', tag: 'Child', shots: [shot('03-child-login-page.png', 'The child-friendly PIN login screen', false)],
    purpose: 'A simplified, playful login built specifically for young children, who cannot be expected to type an email and password.',
    how: 'The child enters the short ID number their parent gave them and taps their 4-digit PIN on a large, friendly number pad — no keyboard typing required.',
    benefits: 'Removes every barrier a young child would face with a traditional login, while still keeping each child\'s account private and secure.',
    example: 'A 6-year-old taps in their ID and PIN independently and is straight into their own reading space in seconds.',
  })}

  <h3 class="subsection-heading">Account Recovery &amp; Verification</h3>
  ${feature({
    id: 'f-forgot', title: 'Forgot Password', tag: 'Public',
    shots: [shot('04-forgot-password-form.png', 'Requesting a password reset link'), shot('05-forgot-password-sent.png', 'Confirmation that a reset link has been sent')],
    purpose: 'Lets a parent regain access to their account if they forget their password, without ever contacting support.',
    how: 'The parent enters their email address; the platform emails them a secure, one-time link to reset their password. For privacy, the same confirmation message is shown whether or not that email is registered.',
    benefits: 'A fully self-service recovery flow that follows the same security practices used by major banking and email providers.',
    example: 'A parent who has not logged in for months requests a reset link, receives it by email, and is back into their account within a minute.',
  })}
  ${feature({
    id: 'f-reset', title: 'Password Reset', tag: 'Public',
    shots: [shot('06-reset-password-form.png', 'Choosing a new password'), shot('07-reset-password-success.png', 'Confirmation that the password has been changed')],
    purpose: 'The second half of the recovery flow — where the parent sets a brand-new password.',
    how: 'The parent follows the secure link from their email and chooses a new password (12 characters or more). Every device previously signed into that account is automatically signed out for safety.',
    benefits: 'Guarantees that only the person with access to the account\'s email can ever regain entry, and that an old, possibly compromised session cannot remain active.',
    example: 'After resetting their password, a parent is asked to sign in again on their laptop, confirming the change took effect immediately.',
  })}
  ${feature({
    id: 'f-verify', title: 'Email Verification', tag: 'Public',
    shots: [shot('08-email-verification-success.png', 'A successfully verified email address', false)],
    purpose: 'Confirms that a parent\'s email address genuinely belongs to them.',
    how: 'After registering, the parent receives a one-time verification link by email. Clicking it instantly confirms their address on the platform.',
    benefits: 'Protects against fake or mistyped email addresses and ensures important account and billing notifications always reach the right inbox.',
    example: 'A newly registered parent clicks the link in their welcome email and sees an instant "verified" confirmation.',
  })}

  <h3 class="subsection-heading">The Parent Experience</h3>
  ${feature({
    id: 'f-parent-dash', title: 'Parent Dashboard', tag: 'Parent',
    shots: [shot('09-parent-dashboard.png', 'The parent dashboard, showing children, subscriptions and recent activity'), shot('10-parent-add-child-dialog.png', 'Adding a new child to the family account'), shot('11-parent-dashboard-two-children.png', 'The dashboard after a second child has been added')],
    purpose: 'The parent\'s home base — a single screen showing every child, their activity, and quick access to every other part of the platform.',
    how: 'At a glance, the parent sees how many children they have, how many active subscriptions, unread notifications, and total diary entries written. Each child appears as its own card with reading streaks and entry counts. A prominent "Add Child" button opens a short form to register a new child with a name, age, age group and a private 4-digit PIN.',
    benefits: 'Everything a parent needs is one click away, with no digging through menus, and adding a new child takes under a minute.',
    example: 'A parent with two children can see at a glance that one child is on a 7-day writing streak, while the other needs a subscription to unlock new stories.',
  })}
  ${feature({
    id: 'f-story-browser', title: 'Story Browser', tag: 'Parent',
    shots: [shot('12-story-browser.png', 'Browsing the library of available storybooks')],
    purpose: 'Lets a parent browse every storybook available to their subscribed children.',
    how: 'Stories are displayed as colourful cards, each showing its age group, theme, and featured character. Parents can search by title or filter by age group to quickly find the right story.',
    benefits: 'Makes it easy for a parent to preview content before their child reads it, and to find stories matched to each child\'s age and interests.',
    example: 'A parent filters the library to "5–7 years" to find a story to read together with their daughter before bed.',
  })}
  ${feature({
    id: 'f-story-reader', title: 'Story Reader', tag: 'Parent',
    shots: [shot('13-story-reader.png', 'Reading a storybook in the page-by-page reader')],
    purpose: 'A beautiful, book-like reading experience for previewing any unlocked story.',
    how: 'Each story opens like a real storybook: a cover page, an introduction to its featured character, a series of illustrated lesson pages, and a closing "moral of the story" page — all navigated with simple page-turn controls.',
    benefits: 'Presents every story in an inviting, screen-friendly format that feels like reading a real book rather than browsing a website.',
    example: 'A parent reads through a story before assigning it, confirming the theme and tone are right for their child.',
  })}
  ${feature({
    id: 'f-diary-parent', title: 'Diary &amp; AI Feedback Summary', tag: 'Parent',
    shots: [shot('14-diary-page-ai-feedback.png', 'A parent reviewing their child\'s diary entries and the AI tutor\'s feedback')],
    purpose: 'Full transparency for parents — every word their child writes, and every response the AI tutor gives, in one place.',
    how: 'The parent selects a child from a dropdown to see that child\'s full diary history side-by-side with the AI tutor\'s feedback for each entry: what it praised, any writing mistakes it gently corrected, a helpful hint, a reflective question, and a note of encouragement.',
    benefits: 'Parents never have to wonder what their child is writing or what the AI is telling them — everything is visible and reviewable at any time, which is central to keeping the experience safe.',
    example: 'A parent notices their child wrote about helping a classmate, reads the AI\'s kind and encouraging response, and brings it up over dinner that evening.',
  })}
  ${feature({
    id: 'f-notifications', title: 'Notifications', tag: 'Parent',
    shots: [shot('15-notifications-page.png', 'The parent notification centre', false)],
    purpose: 'Keeps parents automatically informed of important activity without needing to check in constantly.',
    how: 'The platform raises a notification whenever a child submits a new diary entry, receives AI feedback, or when a subscription is about to expire. A badge on the navigation bar shows how many notifications are unread.',
    benefits: 'Parents stay engaged with their child\'s activity in real time, and never miss a subscription renewal.',
    example: 'A parent gets a notification the moment their child finishes writing their diary entry for the day.',
  })}
  ${feature({
    id: 'f-subscriptions', title: 'Subscriptions', tag: 'Parent',
    shots: [shot('16-subscriptions-page.png', 'Choosing a subscription plan for a child')],
    purpose: 'Where a parent unlocks story content for a child by choosing a subscription plan.',
    how: 'The parent selects a child, an age group, and a duration (1, 2, 3, 6 or 12 months), with the total price calculated automatically. An optional one-time contribution can be added to support the platform. Payment is handled securely through Stripe, a world-leading payment processor — see Section 7 for full details.',
    benefits: 'A clear, flexible pricing model with no hidden steps, letting families choose the commitment level that suits them.',
    example: 'A parent subscribes their child to the "5–7 years" content for 3 months, adds a small optional contribution, and their child\'s stories unlock immediately after payment.',
  })}
  ${feature({
    id: 'f-account-security', title: 'Account &amp; Security', tag: 'Parent',
    shots: [shot('17-account-security-page.png', 'Managing account security settings', false)],
    purpose: 'Gives parents control over their own account\'s security.',
    how: 'From this screen, a parent can review their account details and manage their signed-in sessions and security preferences.',
    benefits: 'Puts account safety directly in the parent\'s hands, in line with modern data-protection best practice.',
    example: 'A parent who signed in on a shared library computer returns home and reviews their account to make sure it is secure.',
  })}

  <h3 class="subsection-heading">The Child Experience</h3>
  ${feature({
    id: 'f-child-dash', title: 'Child Dashboard', tag: 'Child',
    shots: [shot('18-child-dashboard.png', 'The child\'s home screen, with stories, diary, and friendly characters')],
    purpose: 'A warm, playful home screen designed entirely around a child\'s point of view.',
    how: 'Two large, colourful buttons invite the child to "Read Stories" or open "My Diary." Beneath them, the child can see stories they are partway through, their bookmarked favourites, and a gallery of the friendly characters who guide them through the platform. A gentle safety reminder appears at the top of every screen.',
    benefits: 'Everything is large, visual and simple enough for a young child to use independently, with safety built in from the first screen.',
    example: 'A child logs in after school and immediately sees they are halfway through yesterday\'s story, with one tap to continue.',
  })}
  ${feature({
    id: 'f-child-reader', title: 'Child Story Reader', tag: 'Child',
    shots: [shot('19-child-reader-cover.png', 'The story cover page in the child reader'), shot('20-child-reader-page.png', 'Meeting a story character')],
    purpose: 'The same beautiful storybook experience as the parent reader, tailored for the child\'s own account.',
    how: 'The child taps through the story page by page, exactly like turning the pages of a real book. Their reading progress and bookmarks are saved automatically, so they can always pick up where they left off.',
    benefits: 'Encourages independent reading in a format that feels tactile and familiar, while quietly saving progress in the background.',
    example: 'A child reads three pages of a story before dinner, closes the app, and picks up on the very same page the next morning.',
  })}
  ${feature({
    id: 'f-child-diary', title: 'Child Diary Submission', tag: 'Child',
    shots: [shot('21-child-diary-form.png', 'A child writing their daily good-deed diary entry')],
    purpose: 'Where a child records a good deed they did that day, in their own words.',
    how: 'The child picks how they are feeling from a row of friendly mood icons, then writes a short entry about something kind they did. One tap submits it — and, as described fully in Section 4, the AI tutor responds within moments.',
    benefits: 'Builds a daily habit of reflection and kindness in a format so simple a young child can complete it independently.',
    example: 'A child writes "I shared my snack with a friend who forgot their lunch," picks the "Happy" mood, and submits it before returning to reading.',
  })}

  <h3 class="subsection-heading">The Administrator Experience</h3>
  ${feature({
    id: 'f-admin-dash', title: 'Admin Dashboard', tag: 'Admin',
    shots: [shot('22-admin-overview.png', 'The administrator\'s home screen, with platform-wide statistics and recent activity')],
    purpose: 'A single, real-time control centre giving your team an instant overview of the entire platform.',
    how: 'The Overview tab shows live counts of users, children, stories, lessons, diary entries and active subscriptions, alongside a feed of recent family activity and recent subscriptions. Every other management tool — covered in Section 5 — is one click away along the top tab bar.',
    benefits: 'Administrators can see the health and activity of the whole platform at a glance, without navigating through separate reports.',
    example: 'An administrator opens the dashboard each morning to check overnight sign-ups and new diary activity before reviewing the content queue.',
  })}
  ${feature({
    id: 'f-admin-users', title: 'User Management', tag: 'Admin',
    shots: [shot('31-admin-user-management.png', 'Viewing every registered family and child on the platform')],
    purpose: 'Gives administrators full visibility into every family using the platform.',
    how: 'Every child account is listed alongside their parent, age group, age, number of diary entries, and active/inactive status, in a single searchable table.',
    benefits: 'Provides your team with the oversight needed for customer support, safeguarding, and general account administration, all from one screen.',
    example: 'An administrator looks up a family who contacted support to confirm which age group their child is subscribed to.',
  })}
  ${feature({
    id: 'f-admin-billing', title: 'Billing Overview', tag: 'Admin',
    shots: [shot('30-admin-billing.png', 'The administrator\'s view of every subscription on the platform')],
    purpose: 'Gives administrators full oversight of subscription and billing activity across every family.',
    how: 'Every subscription on the platform is listed with its plan, status and value, giving a live picture of subscription revenue and activity without needing to log into Stripe directly.',
    benefits: 'Keeps billing oversight in the same place as content management, so your team never needs to juggle multiple systems to understand the platform\'s subscription activity.',
    example: 'An administrator reviews active subscriptions at the end of the month as part of routine reporting.',
  })}
</section>

<!-- ================= SECTION 4 ================= -->
<section class="section" id="sec-4">
  <div class="section-head"><span class="section-num">4</span><h2>The AI Tutor, Powered by Google Gemini</h2></div>
  <p>One of the platform's most distinctive features is its built-in AI tutor. It is powered by <strong>Google
  Gemini</strong>, one of the world's leading artificial intelligence systems — the same underlying technology family
  used across Google's own products. In Chindela, it takes on the role of a warm, patient character (shown to
  children as "Chindela") who reads what a child writes and responds like a caring, encouraging teacher.</p>

  ${shot('14-diary-page-ai-feedback.png', 'Genuine AI tutor feedback, generated by Google Gemini and reviewed here on the parent\'s Diary page')}

  <h3>How Children Submit Their Work</h3>
  <p>The platform is built to accept a child's work in several formats:</p>
  <ul class="check-list">
    <li><strong>Text</strong> — a child types their diary entry directly, as shown in Section 3.</li>
    <li><strong>Image</strong> — a photo can be attached to an entry (for example, a picture of a kind act, or of handwritten work).</li>
    <li><strong>Audio</strong> — a short voice recording can be attached for children who prefer speaking to typing.</li>
  </ul>

  <h3>How the AI Analyses the Work</h3>
  <p>Once submitted, the entry (and any attached photo or recording) is securely sent to Google Gemini along with a
  set of instructions that shape it into a safe, encouraging tutor for children. Gemini reads the entry the same way
  a kind teacher would: understanding what the child did, checking their writing for small mistakes, and considering
  how best to respond.</p>

  <h3>How the AI Explains Mistakes</h3>
  <p>Rather than simply marking work "right" or "wrong," the AI tutor gently explains any spelling or writing slips
  it notices, in plain, friendly language a child can understand — for example, pointing out that "becuase" should be
  "because," with a short explanation of why it matters for a reader.</p>

  <h3>How the AI Teaches</h3>
  <p>Alongside any correction, the tutor offers a helpful hint or memory trick to help the lesson stick, and a
  thoughtful reflection question to encourage the child to think a little deeper about their good deed — for
  instance, asking how their friend felt when they helped them.</p>

  <h3>How the AI Encourages</h3>
  <p>Every single response includes genuine, specific encouragement. The tutor is designed to always find something
  authentic to praise, so that every child — regardless of their writing ability — finishes the interaction feeling
  proud and motivated to write again tomorrow.</p>

  <h3>How the AI Stores Progress</h3>
  <p>Every diary entry and every AI response is permanently and securely stored against that child's profile. If a
  child chooses to revise an entry using the tutor's hint, the platform keeps a full history of every attempt, so
  progress and improvement over time is always visible.</p>

  <h3>How Parents Can Review It</h3>
  <p>Nothing the AI tutor says to a child is private from their parent. As shown in Section 3, every entry and every
  piece of AI feedback appears on the parent's own Diary page, in full, at any time.</p>
</section>

<!-- ================= SECTION 5 ================= -->
<section class="section" id="sec-5">
  <div class="section-head"><span class="section-num">5</span><h2>Admin Content Management System</h2></div>
  <p>Everything a child sees on Chindela — every story, lesson, character and safety message — is managed by your
  team through the Admin Dashboard, entirely independently, without ever needing to ask a developer to write code or
  deploy a change.</p>

  <div class="cms-grid">
    ${['Stories','Lessons','Characters','Images, Audio, Video &amp; PDFs','Safety Messages','Age Groups','Content Years'].map(x => `<div class="cms-chip">✓ ${x}</div>`).join('')}
  </div>

  <h3 class="subsection-heading">Story Management</h3>
  ${shot('23-admin-story-management.png', 'The Story Management screen, listing every story on the platform')}
  <p>Administrators can create, edit, activate/deactivate, or remove stories from a simple table view. Creating a
  new story takes only a couple of minutes.</p>
  ${shot('32-admin-create-story-dialog.png', 'Creating a brand-new story — title, description, cover image, age group and theme, all from one form')}

  <h3 class="subsection-heading">Lesson Management</h3>
  ${shot('24-admin-lesson-management.png', 'Managing the individual pages (lessons) that make up each story')}
  <p>Each story is made up of a sequence of lesson pages. Administrators can add, reorder, and edit each page's text,
  image, audio narration, and character dialogue.</p>

  <h3 class="subsection-heading">Character Management</h3>
  ${shot('25-admin-character-management.png', 'Managing the friendly characters who guide children through the platform')}
  <p>Each character's name, personality, catchphrase, colour theme and portrait image can be fully customised — new
  characters can be introduced at any time.</p>

  <h3 class="subsection-heading">Age Group Management</h3>
  ${shot('27-admin-age-group-management.png', 'Managing the age bands used to target content')}
  <p>Age groups (such as "3–4 years" or "5–7 years") control which stories and subscriptions are shown to which
  children. New age bands can be added as the platform's audience grows.</p>

  <h3 class="subsection-heading">Safety Header Management</h3>
  ${shot('28-admin-safety-header-management.png', 'Managing the reassuring safety messages shown to children')}
  <p>The gentle safety reminders shown at the top of every child screen (for example, "Always tell a grown-up if
  something makes you feel uncomfortable") are fully editable and can be targeted globally or to a specific age group.</p>

  <h3 class="subsection-heading">Content Year Management</h3>
  ${shot('29-admin-content-year-management.png', 'Managing yearly content themes')}
  <p>Chindela organises its content into yearly themes (for example, "2025 — Year of Kindness"). Administrators can
  plan and activate a new theme for each coming year, giving the platform a fresh focus annually without any
  redevelopment.</p>

  <p class="callout">Because every one of these screens follows the same simple create / edit / delete pattern shown
  above, your team can manage the platform's entire library of educational content independently, for as long as the
  platform runs.</p>
</section>

<!-- ================= SECTION 6 ================= -->
<section class="section" id="sec-6">
  <div class="section-head"><span class="section-num">6</span><h2>Media Library</h2></div>
  <p>All images, audio, video, PDFs and documents used across the platform are managed from one central Media
  Library, available to administrators from every content-editing screen.</p>

  ${shot('26-admin-media-library.png', 'The Media Library, showing uploaded files with filtering and search')}

  <div class="feature-grid">
    <div><h4>Supported File Types</h4><p>Images, audio recordings, video, PDF documents, and general document files — everything needed for rich, multimedia storybooks.</p></div>
    <div><h4>Upload</h4><p>Files are uploaded directly from an administrator's computer and are ready to attach to any story or lesson within moments.</p></div>
    <div><h4>Preview</h4><p>Every file can be previewed directly in the browser before it is used, so administrators can confirm it is correct.</p></div>
    <div><h4>Replace &amp; Delete</h4><p>Outdated files can be replaced with an updated version or removed entirely, keeping the library tidy over time.</p></div>
    <div><h4>Search &amp; Filtering</h4><p>Files can be searched by name and filtered by type (image, audio, video, PDF, document), making it fast to find exactly what is needed even as the library grows.</p></div>
    <div><h4>Secure Storage</h4><p>All uploaded files are stored securely using Amazon Web Services (AWS) cloud storage — the same infrastructure trusted by many of the world's largest websites.</p></div>
  </div>
</section>

<!-- ================= SECTION 7 ================= -->
<section class="section" id="sec-7">
  <div class="section-head"><span class="section-num">7</span><h2>Subscriptions &amp; Payments</h2></div>
  <p>All payments on Chindela are processed through <strong>Stripe</strong>, one of the world's most widely trusted
  online payment providers, used by millions of businesses globally. Chindela never stores a family's card details
  directly — Stripe handles that securely on the platform's behalf.</p>

  ${shot('16-subscriptions-page.png', 'The subscription plans available to parents')}

  <h3>Pricing Plans</h3>
  <div class="pricing-grid">
    <div class="price-card"><strong>1 Month</strong><span>Flexible, short-term access</span></div>
    <div class="price-card"><strong>2 Months</strong><span>A little more value</span></div>
    <div class="price-card"><strong>3 Months</strong><span>A popular seasonal choice</span></div>
    <div class="price-card"><strong>6 Months</strong><span>Better value for committed families</span></div>
    <div class="price-card highlight"><strong>12 Months</strong><span>The best value, for a full year of stories</span></div>
  </div>
  <p>Pricing is consistent across every age group, so families with children of different ages always know what to
  expect. Parents may also add an <strong>optional one-time contribution</strong> at checkout to directly support
  the platform, entirely at their discretion.</p>

  <h3>Test Mode Today, Live Mode at Launch</h3>
  <p>Stripe is currently connected to the platform in <strong>test mode</strong> — the safe, standard way every
  Stripe-powered platform is built and verified before launch. In test mode, the entire subscription and checkout
  journey works exactly as it will for real customers, but no real money changes hands. Before going live, the
  platform simply needs to be switched over to your organisation's live Stripe account (see Sections 10 and 11) —
  no further development work is required to make this switch.</p>
</section>

<!-- ================= SECTION 8 ================= -->
<section class="section" id="sec-8">
  <div class="section-head"><span class="section-num">8</span><h2>Security &amp; Privacy</h2></div>
  <p>Because Chindela is used by children, security has been treated as a foundational requirement throughout the
  platform, not an afterthought. Below is a plain-language summary of the protections already built in.</p>

  <div class="security-grid">
    <div class="sec-card">
      <div class="sec-icon">🔐</div>
      <h4>Secure Login</h4>
      <p>Every sign-in is protected against automated guessing attempts, and repeated failed attempts are
      automatically slowed down to block attackers.</p>
    </div>
    <div class="sec-card">
      <div class="sec-icon">🗝️</div>
      <h4>Encrypted Passwords</h4>
      <p>No password is ever stored in readable form. Every password is transformed using strong, one-way
      encryption before it touches the database, the same standard used by major banks and technology companies.</p>
    </div>
    <div class="sec-card">
      <div class="sec-icon">🧭</div>
      <h4>Role Permissions</h4>
      <p>Administrators, parents and children each see only what they are meant to see. A child, for example, can
      never access a parent's billing details or another family's information.</p>
    </div>
    <div class="sec-card">
      <div class="sec-icon">💳</div>
      <h4>Secure Payments</h4>
      <p>Card payments are handled entirely by Stripe. Chindela never sees or stores full card numbers, meeting the
      same standards used by banks and major retailers.</p>
    </div>
    <div class="sec-card">
      <div class="sec-icon">📁</div>
      <h4>Protected Uploads</h4>
      <p>Every uploaded file is checked and stored in secure, access-controlled cloud storage, preventing
      unauthorised files or access.</p>
    </div>
    <div class="sec-card">
      <div class="sec-icon">⏱️</div>
      <h4>Session Management</h4>
      <p>Parents can review and sign out of any device connected to their account, and a password reset instantly
      signs out every other session automatically.</p>
    </div>
    <div class="sec-card">
      <div class="sec-icon">🧒</div>
      <h4>Safe Child Accounts</h4>
      <p>Children never handle an email address or password. Their simplified PIN login, combined with parental
      oversight of every diary entry and AI response, keeps their experience contained and supervised at all times.</p>
    </div>
  </div>
  <p class="callout">Together, these protections mean that families' personal information, children's activity, and
  every payment are handled with the same level of care as leading consumer platforms.</p>
</section>

<!-- ================= SECTION 9 ================= -->
<section class="section" id="sec-9">
  <div class="section-head"><span class="section-num">9</span><h2>Future Expansion</h2></div>
  <p>Chindela has been deliberately engineered so that its content library can grow without limit and without any
  future redevelopment cost. The platform places no ceiling on:</p>
  <div class="cms-grid">
    ${['Stories','Lessons','Images','Videos','Audio Files','PDFs','Educational Resources','Age Group Content'].map(x => `<div class="cms-chip">∞ Unlimited ${x}</div>`).join('')}
  </div>
  <p>Every one of these is added through the same simple admin screens shown in Section 5. This means your
  organisation's content team can expand Chindela's library for years to come — new stories every month, entirely
  new age groups, additional languages, or new yearly themes — using the tools already built into the platform
  today, with no additional engineering investment required simply to add more content.</p>
</section>

<!-- ================= SECTION 10 ================= -->
<section class="section" id="sec-10">
  <div class="section-head"><span class="section-num">10</span><h2>Infrastructure Required Before Launch</h2></div>
  <p>The platform itself is complete. Before it can go live for real families, a small number of external service
  accounts need to be set up under MJ CIC's own name — this is standard for any modern web platform and keeps your
  organisation in full ownership and control of its own data, domain and finances.</p>

  <table class="infra-table">
    <thead><tr><th>Service</th><th>What It's For</th></tr></thead>
    <tbody>
      <tr><td>Stripe</td><td>Processing real subscription and contribution payments from families.</td></tr>
      <tr><td>Amazon Web Services (AWS S3)</td><td>Secure cloud storage for every story image, audio file, video and document.</td></tr>
      <tr><td>Hosting</td><td>The live server environment where the website will run around the clock.</td></tr>
      <tr><td>Production Database</td><td>The permanent, secure store for every family, child, story and diary entry once live.</td></tr>
      <tr><td>Resend</td><td>Delivers account emails to parents — welcome messages, password resets, and receipts.</td></tr>
      <tr><td>Domain</td><td>Your organisation's own web address (for example, www.chindela.org), so families can find you.</td></tr>
    </tbody>
  </table>
  <p>Setting up each of these accounts typically takes a matter of minutes; guidance for each is provided in Section 12.</p>
</section>

<!-- ================= SECTION 11 ================= -->
<section class="section" id="sec-11">
  <div class="section-head"><span class="section-num">11</span><h2>Current Development Status</h2></div>
  <p>The Chindela platform is <strong>feature-complete</strong>. Every screen described in this guide is already
  built, working, and has been demonstrated with real, live screenshots throughout this document.</p>

  <h3>Completed</h3>
  <div class="status-grid">
    ${['Authentication','Parent Portal','Child Portal','Admin CMS','Story Reader','AI Tutor','Stripe Integration','Media Library','Notifications','Email System','Security','AWS Storage','Account Management','Subscription System','Contributions','Progress Tracking','Responsive Design'].map(x => `<div class="status-item done">✔ ${x}</div>`).join('')}
  </div>

  <h3>Remaining Before Production Launch</h3>
  <div class="status-grid">
    <div class="status-item pending">• Final deployment</div>
    <div class="status-item pending">• Live infrastructure configuration</div>
    <div class="status-item pending">• End-to-end production testing</div>
    <div class="status-item pending">• Stripe Live activation</div>
  </div>
  <p class="callout">It's important to note what these remaining items are <em>not</em>: they are not missing
  features or unfinished screens. Every item above is a <strong>deployment task</strong> — connecting the
  already-built platform to your organisation's own live accounts (Section 10) and switching it on for the public.
  The product itself is done.</p>
</section>

<!-- ================= SECTION 12 ================= -->
<section class="section" id="sec-12">
  <div class="section-head"><span class="section-num">12</span><h2>Next Steps</h2></div>
  <p>To take Chindela from its current, fully-built state to a live public platform, the following steps are needed:</p>

  <ol class="steps-list">
    <li><strong>Create the service accounts</strong> listed in Section 10 — Stripe, AWS, hosting, and Resend — under MJ CIC's own name.</li>
    <li><strong>Provide the resulting credentials</strong> for each service to your development team.</li>
    <li><strong>The developer completes deployment</strong>, connecting the platform to your live accounts and production database.</li>
    <li><strong>The developer performs end-to-end testing</strong> against the live environment, including a full real payment test through Stripe.</li>
    <li><strong>Go live</strong> — the platform is switched on for real families to register and subscribe.</li>
  </ol>
  <p class="callout">We are ready to move to launch as soon as MJ CIC is ready to provide the accounts listed above.</p>
</section>

</body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(HTML_PATH, html, 'utf8');
console.log('Wrote', HTML_PATH, html.length, 'bytes');
