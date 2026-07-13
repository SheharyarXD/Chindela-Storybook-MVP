import { getDb } from "../api/queries/connection";
import * as schema from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed Age Groups
  // Subscription pricing is flat across every age group (see
  // contracts/constants.ts SubscriptionPricingGBPPence) -- age groups only
  // control content targeting here, not price.
  const ageGroupData: schema.InsertAgeGroup[] = [
    { name: "3-4 years", minAge: 3, maxAge: 4, description: "Early childhood - simple stories and visual learning", color: "#FFB347" },
    { name: "5-7 years", minAge: 5, maxAge: 7, description: "Early readers - interactive stories with morals", color: "#77DD77" },
    { name: "8-10 years", minAge: 8, maxAge: 10, description: "Growing readers - deeper themes and reflections", color: "#87CEEB" },
    { name: "11-13 years", minAge: 11, maxAge: 13, description: "Pre-teens - complex narratives and critical thinking", color: "#DDA0DD" },
    { name: "14-16 years", minAge: 14, maxAge: 16, description: "Teens - mature themes and self-reflection", color: "#F0E68C" },
    { name: "18+", minAge: 18, maxAge: 99, description: "Adults - advanced storytelling and life lessons", color: "#CD853F" },
  ];

  for (const ag of ageGroupData) {
    await db.insert(schema.ageGroups).values(ag).onDuplicateKeyUpdate({
      set: ag,
    });
  }
  console.log("Age groups seeded");

  // Seed Characters with images
  const characterData: schema.InsertCharacter[] = [
    {
      name: "Chindela",
      slug: "chindela",
      description: "A wise and kind lion who teaches children about courage, kindness, and wisdom through storytelling.",
      imageUrl: "/chindela.jpg",
      color: "#FFB347",
      personality: "Wise, patient, encouraging, and warm-hearted",
      catchphrase: "Roar with kindness, little one!",
    },
    {
      name: "Silibidi",
      slug: "silibidi",
      description: "A clever and playful monkey who helps children learn through fun adventures and creative problem-solving.",
      imageUrl: "/silibidi.jpg",
      color: "#77DD77",
      personality: "Playful, clever, curious, and creative",
      catchphrase: "Let's swing into learning!",
    },
    {
      name: "Zuri",
      slug: "zuri",
      description: "A gentle elephant who teaches empathy, emotional intelligence, and the importance of listening to others.",
      imageUrl: "/zuri.jpg",
      color: "#87CEEB",
      personality: "Gentle, empathetic, thoughtful, and nurturing",
      catchphrase: "Big hearts make big changes!",
    },
  ];

  for (const char of characterData) {
    await db.insert(schema.characters).values(char).onDuplicateKeyUpdate({
      set: char,
    });
  }
  console.log("Characters seeded");

  // Seed Content Years
  const yearData: schema.InsertContentYear[] = [
    { year: 2025, label: "2025 - Year of Kindness", isActive: true, description: "Focus on teaching kindness and compassion" },
    { year: 2026, label: "2026 - Year of Courage", isActive: false, description: "Focus on building courage and resilience" },
  ];

  for (const y of yearData) {
    await db.insert(schema.contentYears).values(y).onDuplicateKeyUpdate({
      set: y,
    });
  }
  console.log("Content years seeded");

  // Seed Safety Headers
  const safetyData: schema.InsertSafetyHeader[] = [
    { message: "Remember: Always tell a grown-up if something makes you feel uncomfortable.", isGlobal: true, isActive: true },
    { message: "Be kind online and offline - your words have power!", isGlobal: true, isActive: true },
    { message: "If you see something that doesn't look right, ask a trusted adult for help.", isGlobal: true, isActive: true },
    { message: "Your feelings matter - it's okay to talk about how you feel.", isGlobal: true, isActive: true },
  ];

  for (const sh of safetyData) {
    await db.insert(schema.safetyHeaders).values(sh).onDuplicateKeyUpdate({
      set: sh,
    });
  }
  console.log("Safety headers seeded");

  console.log("Seeding complete!");
}

seed().catch(console.error);
