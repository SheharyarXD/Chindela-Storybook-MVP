import { relations } from "drizzle-orm";
import {
  users,
  children,
  ageGroups,
  stories,
  lessons,
  characters,
  safetyHeaders,
  media,
  diaryEntries,
  aiFeedback,
  notifications,
  subscriptions,
  payments,
  contributions,
  contentYears,
  childProgress,
  sessions,
  auditLogs,
  verificationTokens,
} from "./schema";

// ============== USER RELATIONS ==============
export const usersRelations = relations(users, ({ many }) => ({
  children: many(children),
  subscriptions: many(subscriptions),
  payments: many(payments),
  contributions: many(contributions),
  media: many(media),
  sessions: many(sessions),
  auditLogs: many(auditLogs),
  verificationTokens: many(verificationTokens),
}));

// ============== SESSION RELATIONS ==============
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  child: one(children, { fields: [sessions.childId], references: [children.id] }),
}));

// ============== AUDIT LOG RELATIONS ==============
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
  child: one(children, { fields: [auditLogs.childId], references: [children.id] }),
}));

// ============== VERIFICATION TOKEN RELATIONS ==============
export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, { fields: [verificationTokens.userId], references: [users.id] }),
}));

// ============== AGE GROUP RELATIONS ==============
export const ageGroupsRelations = relations(ageGroups, ({ many }) => ({
  children: many(children),
  stories: many(stories),
  safetyHeaders: many(safetyHeaders),
  subscriptions: many(subscriptions),
}));

// ============== CHILD RELATIONS ==============
export const childrenRelations = relations(children, ({ one, many }) => ({
  parent: one(users, {
    fields: [children.parentId],
    references: [users.id],
  }),
  ageGroup: one(ageGroups, {
    fields: [children.ageGroupId],
    references: [ageGroups.id],
  }),
  diaryEntries: many(diaryEntries),
  aiFeedback: many(aiFeedback),
  subscriptions: many(subscriptions),
  progress: many(childProgress),
  sessions: many(sessions),
  auditLogs: many(auditLogs),
}));

// ============== CONTENT YEAR RELATIONS ==============
export const contentYearsRelations = relations(contentYears, ({ many }) => ({
  stories: many(stories),
}));

// ============== CHARACTER RELATIONS ==============
export const charactersRelations = relations(characters, ({ many }) => ({
  stories: many(stories),
  media: many(media),
}));

// ============== STORY RELATIONS ==============
export const storiesRelations = relations(stories, ({ one, many }) => ({
  ageGroup: one(ageGroups, {
    fields: [stories.ageGroupId],
    references: [ageGroups.id],
  }),
  contentYear: one(contentYears, {
    fields: [stories.contentYearId],
    references: [contentYears.id],
  }),
  character: one(characters, {
    fields: [stories.characterId],
    references: [characters.id],
  }),
  lessons: many(lessons),
  media: many(media),
  diaryEntries: many(diaryEntries),
  progress: many(childProgress),
}));

// ============== LESSON RELATIONS ==============
export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  story: one(stories, {
    fields: [lessons.storyId],
    references: [stories.id],
  }),
  media: many(media),
  diaryEntries: many(diaryEntries),
  progress: many(childProgress),
}));

// ============== SAFETY HEADER RELATIONS ==============
export const safetyHeadersRelations = relations(safetyHeaders, ({ one }) => ({
  ageGroup: one(ageGroups, {
    fields: [safetyHeaders.ageGroupId],
    references: [ageGroups.id],
  }),
}));

// ============== MEDIA RELATIONS ==============
export const mediaRelations = relations(media, ({ one }) => ({
  story: one(stories, {
    fields: [media.storyId],
    references: [stories.id],
  }),
  lesson: one(lessons, {
    fields: [media.lessonId],
    references: [lessons.id],
  }),
  character: one(characters, {
    fields: [media.characterId],
    references: [characters.id],
  }),
}));

// ============== DIARY ENTRY RELATIONS ==============
export const diaryEntriesRelations = relations(diaryEntries, ({ one, many }) => ({
  child: one(children, {
    fields: [diaryEntries.childId],
    references: [children.id],
  }),
  story: one(stories, {
    fields: [diaryEntries.storyId],
    references: [stories.id],
  }),
  lesson: one(lessons, {
    fields: [diaryEntries.lessonId],
    references: [lessons.id],
  }),
  aiFeedback: many(aiFeedback),
}));

// ============== AI FEEDBACK RELATIONS ==============
export const aiFeedbackRelations = relations(aiFeedback, ({ one }) => ({
  child: one(children, {
    fields: [aiFeedback.childId],
    references: [children.id],
  }),
}));

// ============== NOTIFICATION RELATIONS ==============
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  child: one(children, {
    fields: [notifications.childId],
    references: [children.id],
  }),
}));

// ============== SUBSCRIPTION RELATIONS ==============
export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  parent: one(users, {
    fields: [subscriptions.parentId],
    references: [users.id],
  }),
  child: one(children, {
    fields: [subscriptions.childId],
    references: [children.id],
  }),
  ageGroup: one(ageGroups, {
    fields: [subscriptions.ageGroupId],
    references: [ageGroups.id],
  }),
  payments: many(payments),
  contributions: many(contributions),
}));

// ============== PAYMENT RELATIONS ==============
export const paymentsRelations = relations(payments, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
  parent: one(users, {
    fields: [payments.parentId],
    references: [users.id],
  }),
}));

// ============== CONTRIBUTION RELATIONS ==============
export const contributionsRelations = relations(contributions, ({ one }) => ({
  parent: one(users, {
    fields: [contributions.parentId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [contributions.subscriptionId],
    references: [subscriptions.id],
  }),
}));

// ============== CHILD PROGRESS RELATIONS ==============
export const childProgressRelations = relations(childProgress, ({ one }) => ({
  child: one(children, {
    fields: [childProgress.childId],
    references: [children.id],
  }),
  story: one(stories, {
    fields: [childProgress.storyId],
    references: [stories.id],
  }),
  lesson: one(lessons, {
    fields: [childProgress.lessonId],
    references: [lessons.id],
  }),
}));
