import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { count, eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { findAllContributions, contributionTotals } from "./queries/contributions";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();

    const [usersCount] = await db
      .select({ count: count() })
      .from(schema.users);
    
    const [childrenCount] = await db
      .select({ count: count() })
      .from(schema.children);
    
    const [storiesCount] = await db
      .select({ count: count() })
      .from(schema.stories);
    
    const [lessonsCount] = await db
      .select({ count: count() })
      .from(schema.lessons);
    
    const [diaryCount] = await db
      .select({ count: count() })
      .from(schema.diaryEntries);
    
    const [subscriptionsCount] = await db
      .select({ count: count() })
      .from(schema.subscriptions);
    
    const [activeSubsCount] = await db
      .select({ count: count() })
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.status, "active"));

    const [notificationsCount] = await db
      .select({ count: count() })
      .from(schema.notifications);

    return {
      users: usersCount.count,
      children: childrenCount.count,
      stories: storiesCount.count,
      lessons: lessonsCount.count,
      diaryEntries: diaryCount.count,
      subscriptions: subscriptionsCount.count,
      activeSubscriptions: activeSubsCount.count,
      notifications: notificationsCount.count,
    };
  }),

  recentActivity: adminQuery.query(async () => {
    const db = getDb();

    const recentDiary = await db.query.diaryEntries.findMany({
      orderBy: (de, { desc }) => [desc(de.createdAt)],
      limit: 10,
      with: {
        child: true,
      },
    });

    const recentSubs = await db.query.subscriptions.findMany({
      orderBy: (s, { desc }) => [desc(s.createdAt)],
      limit: 10,
      with: {
        parent: true,
        child: true,
        ageGroup: true,
      },
    });

    return {
      recentDiaryEntries: recentDiary,
      recentSubscriptions: recentSubs,
    };
  }),

  allChildren: adminQuery.query(async () => {
    const db = getDb();
    return db.query.children.findMany({
      orderBy: (c, { desc }) => [desc(c.createdAt)],
      with: {
        parent: true,
        ageGroup: true,
      },
    });
  }),

  allSubscriptions: adminQuery.query(async () => {
    const db = getDb();
    return db.query.subscriptions.findMany({
      orderBy: (s, { desc }) => [desc(s.createdAt)],
      with: {
        parent: true,
        child: true,
        ageGroup: true,
        payments: true,
      },
    });
  }),

  allContributions: adminQuery.query(async () => {
    return findAllContributions();
  }),

  contributionStats: adminQuery.query(async () => {
    return contributionTotals();
  }),
});
