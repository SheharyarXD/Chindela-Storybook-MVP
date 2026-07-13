// Proactive "your subscription ends soon" email. Intended to run once daily
// via an external scheduler (cron / hosting platform scheduled task) -- see
// docs/DEPLOYMENT.md. Finds subscriptions ending within the reminder window
// that are not set to auto-renew, and skips any subscription that already has
// a reminder notification on file (idempotency without a dedicated column).
import { and, eq, gte, lte } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "../../api/queries/connection";
import { findUserById } from "../../api/queries/users";
import { createNotification } from "../../api/queries/notifications";
import { sendEmail } from "../../api/lib/email";
import { subscriptionExpiryReminderEmail } from "../../api/lib/emailTemplates";

const REMINDER_WINDOW_DAYS = 3;

async function main() {
  const db = getDb();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const expiringSoon = await db.query.subscriptions.findMany({
    where: and(
      eq(schema.subscriptions.status, "active"),
      eq(schema.subscriptions.isAutoRenew, false),
      gte(schema.subscriptions.endDate, now),
      lte(schema.subscriptions.endDate, windowEnd),
    ),
    with: { child: true },
  });

  let sent = 0;
  for (const sub of expiringSoon) {
    const alreadyReminded = await db.query.notifications.findFirst({
      where: and(eq(schema.notifications.type, "subscription_expiry"), eq(schema.notifications.relatedId, sub.id)),
    });
    if (alreadyReminded) continue;

    const parent = await findUserById(sub.parentId);
    if (!parent) continue;

    const endDate = sub.endDate ? new Date(sub.endDate).toLocaleDateString("en-GB") : "soon";
    await createNotification({
      userId: sub.parentId,
      childId: sub.childId,
      type: "subscription_expiry",
      title: "Subscription ending soon",
      message: `Your subscription for ${sub.child?.name ?? "your child"} ends on ${endDate}.`,
      relatedId: sub.id,
    });
    await sendEmail({
      to: parent.email,
      ...subscriptionExpiryReminderEmail({ name: parent.name ?? parent.email, childName: sub.child?.name ?? "your child", endDate }),
    });
    sent += 1;
  }

  console.log(`Sent ${sent} expiry reminder(s) out of ${expiringSoon.length} subscription(s) ending within ${REMINDER_WINDOW_DAYS} day(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
