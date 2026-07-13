import * as cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery, childQuery } from "./middleware";
import { z } from "zod";
import {
  createUser,
  findUserByEmail,
  updateLastSignIn,
  setEmailVerified,
  updatePasswordHash,
} from "./queries/users";
import { findChildForLogin } from "./queries/children";
import { createChildToken, createParentToken, hashSecret, verifySecret, newSid } from "./auth";
import { env } from "./lib/env";
import { verifyAdminBootstrapToken } from "./lib/bootstrap";
import { clientKey } from "./lib/security";
import { createThrottleStore, checkAndRecordAttempt, recordFailure, resetAttempts } from "./lib/loginThrottle";
import {
  createSession,
  revokeSessionByTokenHash,
  revokeAllSessionsForUser,
  revokeSession,
  listActiveSessionsForUser,
  findSessionById,
  extendSession,
} from "./queries/sessions";
import { hashToken, generateToken } from "./lib/tokens";
import { createVerificationToken, findValidToken, markTokenUsed } from "./queries/verificationTokens";
import { logAuditEvent } from "./queries/auditLog";
import { sendEmail } from "./lib/email";
import { welcomeEmail, verificationEmail, passwordResetEmail } from "./lib/emailTemplates";

const credentials = z.object({ email: z.string().email().max(320), password: z.string().min(12).max(128) });

const parentLoginAttempts = createThrottleStore();
const parentLoginIpAttempts = createThrottleStore();
const childLoginAttempts = createThrottleStore();
const childLoginIpAttempts = createThrottleStore();
const registerAttempts = createThrottleStore();
const registerIpAttempts = createThrottleStore();
const passwordResetAttempts = createThrottleStore();

function throttled(...checks: { allowed: boolean; retryAfterSeconds?: number }[]) {
  const blocked = checks.find((c) => !c.allowed);
  return blocked?.retryAfterSeconds;
}

function setSession(headers: Headers, name: string, token: string, requestHeaders: Headers, maxAgeMs: number) {
  const opts = getSessionCookieOptions(requestHeaders);
  headers.append("set-cookie", cookie.serialize(name, token, { httpOnly: true, path: "/", sameSite: opts.sameSite?.toLowerCase() as "lax" | "none", secure: opts.secure, maxAge: maxAgeMs / 1000 }));
}

function clearSession(headers: Headers, name: string, requestHeaders: Headers) {
  const opts = getSessionCookieOptions(requestHeaders);
  headers.append("set-cookie", cookie.serialize(name, "", { httpOnly: opts.httpOnly, path: opts.path, sameSite: opts.sameSite?.toLowerCase() as "lax" | "none", secure: opts.secure, maxAge: 0 }));
}

async function sendVerificationEmail(userId: number, name: string, email: string) {
  const { token, tokenHash } = generateToken();
  await createVerificationToken(userId, "email_verification", tokenHash);
  const verifyUrl = `${env.appUrl}/verify-email?token=${token}`;
  return { verifyUrl, send: () => sendEmail({ to: email, ...verificationEmail(name, verifyUrl) }) };
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  childMe: childQuery.query(async ({ ctx }) => {
    const child = await findChildForLogin(ctx.child.id);
    if (!child || child.parentId !== ctx.child.parentId) throw new Error("Child account unavailable.");
    return { id: child.id, name: child.name, ageGroupId: child.ageGroupId, totalEntries: child.totalEntries, streakDays: child.streakDays };
  }),

  register: publicQuery
    .input(credentials.extend({ name: z.string().trim().min(1).max(255), adminToken: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase();
      const ipKey = clientKey(ctx.req);
      const retryAfterSeconds = throttled(
        checkAndRecordAttempt(email, registerAttempts),
        checkAndRecordAttempt(ipKey, registerIpAttempts),
      );
      if (retryAfterSeconds !== undefined) {
        ctx.resHeaders.set("Retry-After", String(retryAfterSeconds));
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Please try again later." });
      }

      if (await findUserByEmail(email)) {
        recordFailure(email, registerAttempts);
        recordFailure(ipKey, registerIpAttempts);
        throw new Error("An account with that email already exists.");
      }
      const wantsAdmin = Boolean(env.adminEmail) && env.adminEmail === email;
      // Reject outright rather than silently downgrading to a parent account:
      // downgrading would let anyone permanently squat on ADMIN_EMAIL (unique
      // constraint) and lock the real operator out of ever claiming it.
      if (wantsAdmin && !verifyAdminBootstrapToken(input.adminToken)) {
        recordFailure(email, registerAttempts);
        recordFailure(ipKey, registerIpAttempts);
        throw new Error("This email is reserved for the platform administrator. Provide the correct bootstrap token to claim it.");
      }
      const role = wantsAdmin ? "admin" : "parent";
      const user = await createUser({ name: input.name, email, passwordHash: await hashSecret(input.password), role });
      if (!user) throw new Error("Unable to create account.");
      resetAttempts(email, registerAttempts);
      resetAttempts(ipKey, registerIpAttempts);

      const sid = newSid();
      await createSession({
        userId: user.id,
        tokenHash: hashToken(sid),
        userAgent: ctx.req.headers.get("user-agent") ?? undefined,
        ipAddress: ipKey,
        rememberMe: false,
        expiresAt: new Date(Date.now() + Session.maxAgeMs),
      });
      setSession(ctx.resHeaders, Session.cookieName, await createParentToken(user.id, role, sid), ctx.req.headers, Session.maxAgeMs);
      await logAuditEvent({ userId: user.id, action: "register", ipAddress: ipKey, userAgent: ctx.req.headers.get("user-agent") ?? undefined });

      const verification = await sendVerificationEmail(user.id, user.name ?? user.email, user.email);
      await sendEmail({ to: user.email, ...welcomeEmail(user.name ?? user.email, verification.verifyUrl) });

      return user;
    }),

  login: publicQuery
    .input(credentials.extend({ rememberMe: z.boolean().default(false) }))
    .mutation(async ({ input, ctx }) => {
      const emailKey = input.email.toLowerCase();
      const ipKey = clientKey(ctx.req);
      const retryAfterSeconds = throttled(
        checkAndRecordAttempt(emailKey, parentLoginAttempts),
        checkAndRecordAttempt(ipKey, parentLoginIpAttempts),
      );
      if (retryAfterSeconds !== undefined) {
        ctx.resHeaders.set("Retry-After", String(retryAfterSeconds));
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Invalid email or password." });
      }

      const user = await findUserByEmail(emailKey);
      if (!user || !(await verifySecret(input.password, user.passwordHash))) {
        recordFailure(emailKey, parentLoginAttempts);
        recordFailure(ipKey, parentLoginIpAttempts);
        await logAuditEvent({ action: "login_failed", ipAddress: ipKey, userAgent: ctx.req.headers.get("user-agent") ?? undefined, metadata: { email: emailKey } });
        throw new Error("Invalid email or password.");
      }
      resetAttempts(emailKey, parentLoginAttempts);
      resetAttempts(ipKey, parentLoginIpAttempts);
      await updateLastSignIn(user.id);

      const maxAgeMs = input.rememberMe ? Session.rememberMeMaxAgeMs : Session.maxAgeMs;
      const sid = newSid();
      await createSession({
        userId: user.id,
        tokenHash: hashToken(sid),
        userAgent: ctx.req.headers.get("user-agent") ?? undefined,
        ipAddress: ipKey,
        rememberMe: input.rememberMe,
        expiresAt: new Date(Date.now() + maxAgeMs),
      });
      setSession(ctx.resHeaders, Session.cookieName, await createParentToken(user.id, user.role, sid, input.rememberMe), ctx.req.headers, maxAgeMs);
      await logAuditEvent({ userId: user.id, action: "login_success", ipAddress: ipKey, userAgent: ctx.req.headers.get("user-agent") ?? undefined });
      return user;
    }),

  childLogin: publicQuery
    .input(z.object({ childId: z.number().int().positive(), pin: z.string().regex(/^\d{4}$/) }))
    .mutation(async ({ input, ctx }) => {
      const childKey = String(input.childId);
      const ipKey = clientKey(ctx.req);
      const retryAfterSeconds = throttled(
        checkAndRecordAttempt(childKey, childLoginAttempts),
        checkAndRecordAttempt(ipKey, childLoginIpAttempts),
      );
      if (retryAfterSeconds !== undefined) {
        ctx.resHeaders.set("Retry-After", String(retryAfterSeconds));
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Invalid child ID or PIN." });
      }

      const child = await findChildForLogin(input.childId);
      if (!child || !(await verifySecret(input.pin, child.pinHash))) {
        recordFailure(childKey, childLoginAttempts);
        recordFailure(ipKey, childLoginIpAttempts);
        await logAuditEvent({ action: "child_login_failed", ipAddress: ipKey, userAgent: ctx.req.headers.get("user-agent") ?? undefined, metadata: { childId: input.childId } });
        throw new Error("Invalid child ID or PIN.");
      }
      resetAttempts(childKey, childLoginAttempts);
      resetAttempts(ipKey, childLoginIpAttempts);

      const sid = newSid();
      await createSession({
        childId: child.id,
        tokenHash: hashToken(sid),
        userAgent: ctx.req.headers.get("user-agent") ?? undefined,
        ipAddress: ipKey,
        expiresAt: new Date(Date.now() + Session.maxAgeMs),
      });
      setSession(ctx.resHeaders, Session.childCookieName, await createChildToken(child.id, child.parentId, sid), ctx.req.headers, Session.maxAgeMs);
      await logAuditEvent({ childId: child.id, action: "child_login_success", ipAddress: ipKey, userAgent: ctx.req.headers.get("user-agent") ?? undefined });
      return { id: child.id, name: child.name, ageGroupId: child.ageGroupId };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    if (ctx.sessionTokenHash) await revokeSessionByTokenHash(ctx.sessionTokenHash);
    clearSession(ctx.resHeaders, Session.cookieName, ctx.req.headers);
    await logAuditEvent({ userId: ctx.user.id, action: "logout" });
    return { success: true };
  }),

  logoutAll: authedQuery.mutation(async ({ ctx }) => {
    await revokeAllSessionsForUser(ctx.user.id);
    clearSession(ctx.resHeaders, Session.cookieName, ctx.req.headers);
    await logAuditEvent({ userId: ctx.user.id, action: "logout_all" });
    return { success: true };
  }),

  mySessions: authedQuery.query(async ({ ctx }) => {
    const sessions = await listActiveSessionsForUser(ctx.user.id);
    return sessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      rememberMe: s.rememberMe,
      lastSeenAt: s.lastSeenAt,
      createdAt: s.createdAt,
      isCurrent: s.tokenHash === ctx.sessionTokenHash,
    }));
  }),

  revokeSession: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const session = await findSessionById(input.id);
      if (!session || session.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "Session not found." });
      await revokeSession(input.id);
      await logAuditEvent({ userId: ctx.user.id, action: "session_revoked", metadata: { sessionId: input.id } });
      return { success: true };
    }),

  refreshSession: authedQuery.mutation(async ({ ctx }) => {
    if (!ctx.sessionId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const current = await findSessionById(ctx.sessionId);
    const rememberMe = current?.rememberMe ?? false;
    const maxAgeMs = rememberMe ? Session.rememberMeMaxAgeMs : Session.maxAgeMs;
    const sid = newSid();
    await extendSession(ctx.sessionId, new Date(Date.now() + maxAgeMs), hashToken(sid));
    setSession(ctx.resHeaders, Session.cookieName, await createParentToken(ctx.user.id, ctx.user.role, sid, rememberMe), ctx.req.headers, maxAgeMs);
    return { success: true };
  }),

  childLogout: publicQuery.mutation(async ({ ctx }) => {
    if (ctx.sessionTokenHash) await revokeSessionByTokenHash(ctx.sessionTokenHash);
    clearSession(ctx.resHeaders, Session.childCookieName, ctx.req.headers);
    return { success: true };
  }),

  resendVerification: authedQuery.mutation(async ({ ctx }) => {
    if (ctx.user.emailVerifiedAt) return { success: true };
    const verification = await sendVerificationEmail(ctx.user.id, ctx.user.name ?? ctx.user.email, ctx.user.email);
    await verification.send();
    return { success: true };
  }),

  verifyEmail: publicQuery
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const tokenHash = hashToken(input.token);
      const record = await findValidToken(tokenHash, "email_verification");
      if (!record) throw new TRPCError({ code: "BAD_REQUEST", message: "This verification link is invalid or has expired." });
      await setEmailVerified(record.userId);
      await markTokenUsed(record.id);
      await logAuditEvent({ userId: record.userId, action: "email_verified" });
      return { success: true };
    }),

  requestPasswordReset: publicQuery
    .input(z.object({ email: z.string().email().max(320) }))
    .mutation(async ({ input, ctx }) => {
      const emailKey = input.email.toLowerCase();
      const ipKey = clientKey(ctx.req);
      const retryAfterSeconds = throttled(checkAndRecordAttempt(ipKey, passwordResetAttempts));
      if (retryAfterSeconds !== undefined) {
        ctx.resHeaders.set("Retry-After", String(retryAfterSeconds));
        // Same generic response as success -- never reveal rate-limit state to
        // an unauthenticated caller probing for valid emails.
        return { success: true };
      }
      const user = await findUserByEmail(emailKey);
      // Always return the same response whether or not the account exists --
      // this prevents user enumeration via this endpoint.
      if (user) {
        const { token, tokenHash } = generateToken();
        await createVerificationToken(user.id, "password_reset", tokenHash);
        const resetUrl = `${env.appUrl}/reset-password?token=${token}`;
        await sendEmail({ to: user.email, ...passwordResetEmail(user.name ?? user.email, resetUrl) });
        await logAuditEvent({ userId: user.id, action: "password_reset_requested", ipAddress: ipKey });
      }
      return { success: true };
    }),

  resetPassword: publicQuery
    .input(z.object({ token: z.string().min(1), password: z.string().min(12).max(128) }))
    .mutation(async ({ input }) => {
      const tokenHash = hashToken(input.token);
      const record = await findValidToken(tokenHash, "password_reset");
      if (!record) throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link is invalid or has expired." });
      await updatePasswordHash(record.userId, await hashSecret(input.password));
      await markTokenUsed(record.id);
      // Force re-authentication everywhere -- a password reset must invalidate
      // any session that might have been established by whoever had the old password.
      await revokeAllSessionsForUser(record.userId);
      await logAuditEvent({ userId: record.userId, action: "password_reset_completed" });
      return { success: true };
    }),
});
