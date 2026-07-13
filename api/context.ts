import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { readSessions } from "./auth";
import { findUserById } from "./queries/users";
import { findActiveSessionByTokenHash, touchSession } from "./queries/sessions";
import { hashToken } from "./lib/tokens";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  child?: { id: number; parentId: number };
  // The DB-backed session row id/tokenHash behind the current request's JWT --
  // present only when that session hasn't been revoked or expired server-side.
  // Needed by logout/refresh/device-list endpoints to act on "this" session.
  sessionId?: number;
  sessionTokenHash?: string;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  const sessions = await readSessions(opts.req.headers);

  if (sessions.parent?.type === "parent") {
    const tokenHash = hashToken(sessions.parent.sid);
    const dbSession = await findActiveSessionByTokenHash(tokenHash);
    if (dbSession) {
      ctx.user = await findUserById(sessions.parent.userId);
      ctx.sessionId = dbSession.id;
      ctx.sessionTokenHash = tokenHash;
      void touchSession(dbSession.id).catch(() => undefined);
    }
  }
  if (sessions.child?.type === "child") {
    const tokenHash = hashToken(sessions.child.sid);
    const dbSession = await findActiveSessionByTokenHash(tokenHash);
    if (dbSession) {
      ctx.child = { id: sessions.child.childId, parentId: sessions.child.parentId };
      ctx.sessionId = dbSession.id;
      ctx.sessionTokenHash = tokenHash;
      void touchSession(dbSession.id).catch(() => undefined);
    }
  }
  return ctx;
}
