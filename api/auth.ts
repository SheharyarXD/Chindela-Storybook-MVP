import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import * as jose from "jose";
import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { env } from "./lib/env";

const scrypt = promisify(scryptCallback);
const secret = new TextEncoder().encode(env.sessionSecret);

export type ParentSession = { type: "parent"; userId: number; role: "admin" | "parent"; sid: string };
export type ChildSession = { type: "child"; childId: number; parentId: number; sid: string };

export async function hashSecret(value: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(value, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifySecret(value: string, stored: string) {
  const [algorithm, salt, digest] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !digest) return false;
  const actual = (await scrypt(value, salt, 64)) as Buffer;
  const expected = Buffer.from(digest, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function sign(claim: ParentSession | ChildSession, expiresIn: string) {
  return new jose.SignJWT(claim).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(expiresIn).sign(secret);
}

// A fresh random session id, embedded in the JWT and (hashed) stored as the
// sessions table's lookup key -- this is what makes revocation/"logout
// everywhere"/device tracking possible despite the token itself being stateless.
export function newSid(): string {
  return randomBytes(16).toString("hex");
}

export const REMEMBER_ME_EXPIRY = "30d";
export const DEFAULT_EXPIRY = "12h";

export async function createParentToken(userId: number, role: ParentSession["role"], sid: string, rememberMe = false) {
  return sign({ type: "parent", userId, role, sid }, rememberMe ? REMEMBER_ME_EXPIRY : DEFAULT_EXPIRY);
}
export async function createChildToken(childId: number, parentId: number, sid: string) {
  return sign({ type: "child", childId, parentId, sid }, DEFAULT_EXPIRY);
}

async function verify<T>(token?: string): Promise<T | undefined> {
  if (!token) return undefined;
  try { return (await jose.jwtVerify(token, secret, { algorithms: ["HS256"] })).payload as T; }
  catch { return undefined; }
}
export async function readSessions(headers: Headers) {
  const parsed = cookie.parse(headers.get("cookie") ?? "");
  return { parent: await verify<ParentSession>(parsed[Session.cookieName]), child: await verify<ChildSession>(parsed[Session.childCookieName]) };
}
