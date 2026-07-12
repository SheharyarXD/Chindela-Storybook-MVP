import * as cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery, childQuery } from "./middleware";
import { z } from "zod";
import { createUser, findUserByEmail, updateLastSignIn } from "./queries/users";
import { findChildForLogin } from "./queries/children";
import { createChildToken, createParentToken, hashSecret, verifySecret } from "./auth";
import { env } from "./lib/env";
import { verifyAdminBootstrapToken } from "./lib/bootstrap";
import { clientKey } from "./lib/security";
import { createThrottleStore, checkAndRecordAttempt, recordFailure, resetAttempts } from "./lib/loginThrottle";

const credentials = z.object({ email: z.string().email().max(320), password: z.string().min(12).max(128) });

const parentLoginAttempts = createThrottleStore();
const parentLoginIpAttempts = createThrottleStore();
const childLoginAttempts = createThrottleStore();
const childLoginIpAttempts = createThrottleStore();

function throttled(...checks: { allowed: boolean; retryAfterSeconds?: number }[]) {
  const blocked = checks.find((c) => !c.allowed);
  return blocked?.retryAfterSeconds;
}

function setSession(headers: Headers, name: string, token: string, requestHeaders: Headers) {
  const opts = getSessionCookieOptions(requestHeaders);
  headers.append("set-cookie", cookie.serialize(name, token, { httpOnly: true, path: "/", sameSite: opts.sameSite?.toLowerCase() as "lax" | "none", secure: opts.secure, maxAge: Session.maxAgeMs / 1000 }));
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
      if (await findUserByEmail(email)) throw new Error("An account with that email already exists.");
      const wantsAdmin = Boolean(env.adminEmail) && env.adminEmail === email;
      // Reject outright rather than silently downgrading to a parent account:
      // downgrading would let anyone permanently squat on ADMIN_EMAIL (unique
      // constraint) and lock the real operator out of ever claiming it.
      if (wantsAdmin && !verifyAdminBootstrapToken(input.adminToken)) {
        throw new Error("This email is reserved for the platform administrator. Provide the correct bootstrap token to claim it.");
      }
      const role = wantsAdmin ? "admin" : "parent";
      const user = await createUser({ name: input.name, email, passwordHash: await hashSecret(input.password), role });
      if (!user) throw new Error("Unable to create account.");
      setSession(ctx.resHeaders, Session.cookieName, await createParentToken(user.id, role), ctx.req.headers);
      return user;
    }),
  login: publicQuery.input(credentials).mutation(async ({ input, ctx }) => {
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
      throw new Error("Invalid email or password.");
    }
    resetAttempts(emailKey, parentLoginAttempts);
    resetAttempts(ipKey, parentLoginIpAttempts);
    await updateLastSignIn(user.id);
    setSession(ctx.resHeaders, Session.cookieName, await createParentToken(user.id, user.role), ctx.req.headers);
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
        throw new Error("Invalid child ID or PIN.");
      }
      resetAttempts(childKey, childLoginAttempts);
      resetAttempts(ipKey, childLoginIpAttempts);
      setSession(ctx.resHeaders, Session.childCookieName, await createChildToken(child.id, child.parentId), ctx.req.headers);
      return { id: child.id, name: child.name, ageGroupId: child.ageGroupId };
    }),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
  childLogout: publicQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append("set-cookie", cookie.serialize(Session.childCookieName, "", { httpOnly: true, path: "/", sameSite: opts.sameSite?.toLowerCase() as "lax" | "none", secure: opts.secure, maxAge: 0 }));
    return { success: true };
  }),
});
