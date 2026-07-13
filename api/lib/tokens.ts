import { randomBytes, createHash } from "node:crypto";

// Raw tokens are only ever handed to the client (in an email link) -- the DB
// stores just the SHA-256 hash, mirroring the admin bootstrap token pattern.
export function generateToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
