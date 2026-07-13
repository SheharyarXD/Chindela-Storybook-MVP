import { eq, and, isNull, gte } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export function ttlForPurpose(purpose: "email_verification" | "password_reset") {
  return purpose === "email_verification" ? EMAIL_VERIFICATION_TTL_MS : PASSWORD_RESET_TTL_MS;
}

export async function createVerificationToken(
  userId: number,
  purpose: "email_verification" | "password_reset",
  tokenHash: string,
) {
  await getDb()
    .insert(schema.verificationTokens)
    .values({ userId, purpose, tokenHash, expiresAt: new Date(Date.now() + ttlForPurpose(purpose)) });
}

export async function findValidToken(tokenHash: string, purpose: "email_verification" | "password_reset") {
  return getDb().query.verificationTokens.findFirst({
    where: and(
      eq(schema.verificationTokens.tokenHash, tokenHash),
      eq(schema.verificationTokens.purpose, purpose),
      isNull(schema.verificationTokens.usedAt),
      gte(schema.verificationTokens.expiresAt, new Date()),
    ),
  });
}

export async function markTokenUsed(id: number) {
  await getDb().update(schema.verificationTokens).set({ usedAt: new Date() }).where(eq(schema.verificationTokens.id, id));
}
