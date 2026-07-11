import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import {
  findDiaryEntriesByChild,
  createDiaryEntry,
  findAIFeedbackByChild,
  findUndeliveredFeedback,
  createAIFeedback,
  markFeedbackAsDelivered,
} from "./queries/diary";
import { incrementChildStats } from "./queries/children";
import { createNotification } from "./queries/notifications";

// Simulated AI feedback generator (replace with real Gemini API)
async function generateAIFeedback(_entryText: string, childName: string, characterName: string) {
  const char = characterName || "Chindela";
  
  // Positive encouragement patterns
  const encouragements = [
    `Wow, ${childName}! That was such a kind thing you did! ${char} is so proud of you!`,
    `Amazing work, ${childName}! You're becoming such a wonderful person! ${char} noticed your kindness!`,
    `${childName}, what a beautiful act of kindness! ${char} thinks you're absolutely wonderful!`,
    `That's fantastic, ${childName}! ${char} loves seeing you spread kindness everywhere you go!`,
  ];

  const reflections = [
    "Think about how your kindness made someone else feel. How did it make YOU feel inside?",
    "When we do good things, we create a chain of happiness. Who might you inspire to be kind too?",
    "Every small act of kindness is like planting a seed. What kind of garden are you growing?",
    "Your kindness is like a superpower! How can you use it again tomorrow?",
  ];

  const suggestions = [
    "Try giving someone a compliment today - it costs nothing but means everything!",
    "Help tidy up without being asked - it's a wonderful surprise for your family!",
    "Draw a picture for someone you care about - art is love you can see!",
    "Share something you love with a friend - sharing doubles the joy!",
  ];

  const randomIndex = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  return {
    positiveFeedback: randomIndex(encouragements),
    reflectionGuidance: randomIndex(reflections),
    encouragement: `Keep shining bright, ${childName}! The world needs more people like you!`,
    safeSuggestions: randomIndex(suggestions),
    characterName: char,
  };
}

export const diaryRouter = createRouter({
  list: authedQuery
    .input(z.object({ childId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify the child belongs to the parent
      const { findChildById } = await import("./queries/children");
      const child = await findChildById(input.childId);
      if (!child || child.parentId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return findDiaryEntriesByChild(input.childId);
    }),

  create: publicQuery
    .input(
      z.object({
        childId: z.number(),
        storyId: z.number().optional(),
        lessonId: z.number().optional(),
        textContent: z.string().optional(),
        audioUrl: z.string().optional(),
        imageUrl: z.string().optional(),
        mood: z.string().optional(),
        entryDate: z.string(), // ISO date string
      })
    )
    .mutation(async ({ input }) => {
      const { findChildById } = await import("./queries/children");
      const child = await findChildById(input.childId);
      if (!child) throw new Error("Child not found");

      const entry = await createDiaryEntry({
        childId: input.childId,
        storyId: input.storyId,
        lessonId: input.lessonId,
        textContent: input.textContent,
        audioUrl: input.audioUrl,
        imageUrl: input.imageUrl,
        mood: input.mood,
        entryDate: new Date(input.entryDate),
      });

      // Increment child stats
      await incrementChildStats(input.childId);

      // Generate AI feedback
      const feedback = await generateAIFeedback(
        input.textContent || "",
        child.name,
        child.favoriteCharacter || "Chindela"
      );

      await createAIFeedback({
        entryId: entry!.id,
        childId: input.childId,
        positiveFeedback: feedback.positiveFeedback,
        reflectionGuidance: feedback.reflectionGuidance,
        encouragement: feedback.encouragement,
        safeSuggestions: feedback.safeSuggestions,
        characterName: feedback.characterName,
      });

      // Create notification for parent
      await createNotification({
        userId: child.parentId,
        childId: input.childId,
        type: "diary_entry",
        title: `${child.name} submitted a new diary entry!`,
        message: input.textContent
          ? `"${input.textContent.substring(0, 100)}..."`
          : "A new diary entry has been submitted.",
        relatedId: entry!.id,
      });

      return entry;
    }),

  // AI Feedback
  feedback: authedQuery
    .input(z.object({ childId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { findChildById } = await import("./queries/children");
      const child = await findChildById(input.childId);
      if (!child || child.parentId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return findAIFeedbackByChild(input.childId);
    }),

  undeliveredFeedback: publicQuery
    .input(z.object({ childId: z.number() }))
    .query(async ({ input }) => {
      return findUndeliveredFeedback(input.childId);
    }),

  markFeedbackDelivered: publicQuery
    .input(z.object({ feedbackId: z.number() }))
    .mutation(async ({ input }) => {
      await markFeedbackAsDelivered(input.feedbackId);
      return { success: true };
    }),
});
