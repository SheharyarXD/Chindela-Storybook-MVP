import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-session-secret-at-least-32-chars-long";
});

describe("hashSecret / verifySecret", () => {
  it("verifies a matching password against its hash", async () => {
    const { hashSecret, verifySecret } = await import("./auth");
    const hash = await hashSecret("correct horse battery staple");
    expect(await verifySecret("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects a non-matching password", async () => {
    const { hashSecret, verifySecret } = await import("./auth");
    const hash = await hashSecret("correct horse battery staple");
    expect(await verifySecret("wrong password", hash)).toBe(false);
  });

  it("produces a different hash (different salt) for the same input each time", async () => {
    const { hashSecret } = await import("./auth");
    const a = await hashSecret("same-password");
    const b = await hashSecret("same-password");
    expect(a).not.toBe(b);
  });

  it("rejects malformed stored hashes gracefully instead of throwing", async () => {
    const { verifySecret } = await import("./auth");
    expect(await verifySecret("anything", "not-a-real-hash")).toBe(false);
  });
});

describe("session token sign/verify round trip", () => {
  it("round-trips a parent session with its sid intact", async () => {
    const { createParentToken, readSessions, newSid } = await import("./auth");
    const { Session } = await import("@contracts/constants");
    const sid = newSid();
    const token = await createParentToken(1, "parent", sid, false);
    const headers = new Headers({ cookie: `${Session.cookieName}=${token}` });
    const sessions = await readSessions(headers);
    expect(sessions.parent).toMatchObject({ type: "parent", userId: 1, role: "parent", sid });
  });

  it("round-trips a child session with its sid intact", async () => {
    const { createChildToken, readSessions, newSid } = await import("./auth");
    const { Session } = await import("@contracts/constants");
    const sid = newSid();
    const token = await createChildToken(42, 7, sid);
    const headers = new Headers({ cookie: `${Session.childCookieName}=${token}` });
    const sessions = await readSessions(headers);
    expect(sessions.child).toMatchObject({ type: "child", childId: 42, parentId: 7, sid });
  });

  it("returns undefined for a missing or tampered cookie instead of throwing", async () => {
    const { readSessions } = await import("./auth");
    const { Session } = await import("@contracts/constants");
    const headers = new Headers({ cookie: `${Session.cookieName}=not-a-real-jwt` });
    const sessions = await readSessions(headers);
    expect(sessions.parent).toBeUndefined();
  });

  it("generates a fresh, distinct sid on every call", async () => {
    const { newSid } = await import("./auth");
    expect(newSid()).not.toBe(newSid());
  });
});
