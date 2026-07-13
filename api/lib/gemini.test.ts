import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TRPCError } from "@trpc/server";

describe("guessMimeTypeFromUrl", () => {
  it("infers common image/audio MIME types from the URL extension", async () => {
    const { guessMimeTypeFromUrl } = await import("./gemini");
    expect(guessMimeTypeFromUrl("https://bucket.s3.amazonaws.com/media/image/abc.png")).toBe("image/png");
    expect(guessMimeTypeFromUrl("https://bucket.s3.amazonaws.com/media/audio/clip.mp3")).toBe("audio/mpeg");
    expect(guessMimeTypeFromUrl("https://bucket.s3.amazonaws.com/media/image/photo.JPG")).toBe("image/jpeg");
  });

  it("returns undefined for an unrecognized or missing extension", async () => {
    const { guessMimeTypeFromUrl } = await import("./gemini");
    expect(guessMimeTypeFromUrl("https://bucket.s3.amazonaws.com/media/document/report.pdf")).toBeUndefined();
    expect(guessMimeTypeFromUrl("https://bucket.s3.amazonaws.com/media/image/no-extension")).toBeUndefined();
  });
});

describe("generateTutorFeedback", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("./env");
    global.fetch = originalFetch;
  });

  it("throws a clear, typed error when Gemini is not configured, rather than a raw fetch failure", async () => {
    // Mocked directly (rather than deleting process.env.GEMINI_API_KEY) so
    // this test is correct regardless of whether a real key happens to be
    // present in the local .env used by other parts of the app.
    vi.doMock("./env", () => ({ env: { geminiApiKey: "", geminiModel: "gemini-flash-latest" } }));
    const { generateTutorFeedback } = await import("./gemini");
    await expect(
      generateTutorFeedback({ entryText: "I helped my friend today.", childName: "Alex", characterName: "Chindela" })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("wraps a malformed/incomplete upstream response in a typed BAD_GATEWAY error after retrying once", async () => {
    vi.doMock("./env", () => ({ env: { geminiApiKey: "test-key", geminiModel: "gemini-flash-latest" } }));
    let calls = 0;
    global.fetch = vi.fn(async () => {
      calls += 1;
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "not valid json" }] } }] }), { status: 200 });
    }) as unknown as typeof fetch;

    const { generateTutorFeedback } = await import("./gemini");
    await expect(
      generateTutorFeedback({ entryText: "I helped my friend today.", childName: "Alex", characterName: "Chindela" })
    ).rejects.toBeInstanceOf(TRPCError);
    expect(calls).toBe(2); // confirms the one-retry behavior actually ran
  });
});
