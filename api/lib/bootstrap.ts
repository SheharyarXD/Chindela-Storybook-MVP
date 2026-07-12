import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { env } from "./env";

// Closes the "whoever registers with ADMIN_EMAIL first wins the admin role" race:
// registration additionally requires this token, proving the registrant controls
// the server console/env, not just knowledge of the admin email address.
let activeToken = env.adminBootstrapToken;

export function initAdminBootstrap() {
  if (env.adminEmail && !activeToken) {
    activeToken = randomBytes(24).toString("hex");
    console.log(`=== Admin bootstrap token (one-time; set ADMIN_BOOTSTRAP_TOKEN to persist it): ${activeToken} ===`);
  }
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function verifyAdminBootstrapToken(candidate: string | undefined): boolean {
  if (!activeToken || !candidate) return false;
  return timingSafeEqual(digest(candidate), digest(activeToken));
}
