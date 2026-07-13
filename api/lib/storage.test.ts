import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.AWS_REGION = "eu-west-2";
  process.env.AWS_S3_BUCKET = "test-bucket";
  process.env.AWS_ACCESS_KEY_ID = "AKIATEST";
  process.env.AWS_SECRET_ACCESS_KEY = "test-secret";
});

describe("validateUpload", () => {
  it("accepts a valid image within size and MIME allowlist", async () => {
    const { validateUpload } = await import("./storage");
    expect(() => validateUpload("image", "image/png", 1024, "cover.png")).not.toThrow();
  });

  it("rejects a disallowed MIME type for the category", async () => {
    const { validateUpload, MediaValidationError } = await import("./storage");
    expect(() => validateUpload("image", "application/pdf", 1024, "cover.png")).toThrow(MediaValidationError);
  });

  it("rejects a file over the category's size limit", async () => {
    const { validateUpload, MediaValidationError } = await import("./storage");
    expect(() => validateUpload("image", "image/png", 50 * 1024 * 1024, "huge.png")).toThrow(MediaValidationError);
  });

  it("rejects zero or negative size", async () => {
    const { validateUpload, MediaValidationError } = await import("./storage");
    expect(() => validateUpload("image", "image/png", 0, "empty.png")).toThrow(MediaValidationError);
  });

  it("rejects a mismatched extension for an otherwise-allowed MIME type", async () => {
    const { validateUpload, MediaValidationError } = await import("./storage");
    expect(() => validateUpload("image", "image/png", 1024, "cover.exe")).toThrow(MediaValidationError);
  });

  it("allows a video within its own, larger size limit", async () => {
    const { validateUpload } = await import("./storage");
    expect(() => validateUpload("video", "video/mp4", 100 * 1024 * 1024, "story.mp4")).not.toThrow();
  });
});

describe("buildObjectKey", () => {
  it("never embeds the original filename or path segments in the key", async () => {
    const { buildObjectKey } = await import("./storage");
    const key = buildObjectKey("image", "../../etc/passwd.png");
    expect(key).toMatch(/^media\/image\/[a-f0-9-]+\.png$/);
    expect(key).not.toContain("..");
    expect(key).not.toContain("passwd");
  });

  it("produces a unique key on every call", async () => {
    const { buildObjectKey } = await import("./storage");
    const a = buildObjectKey("audio", "clip.mp3");
    const b = buildObjectKey("audio", "clip.mp3");
    expect(a).not.toBe(b);
  });
});

describe("isOwnStorageUrl", () => {
  it("accepts a URL pointing at our own configured S3 bucket", async () => {
    const { isOwnStorageUrl, publicUrlFor } = await import("./storage");
    expect(isOwnStorageUrl(publicUrlFor("media/image/abc.png"))).toBe(true);
  });

  it("rejects a URL pointing at an unrelated or internal host (SSRF guard)", async () => {
    const { isOwnStorageUrl } = await import("./storage");
    expect(isOwnStorageUrl("http://169.254.169.254/latest/meta-data/")).toBe(false);
    expect(isOwnStorageUrl("https://evil.example.com/media/image/abc.png")).toBe(false);
    expect(isOwnStorageUrl("not a url")).toBe(false);
  });

  it("rejects a plain-http URL even against the right host", async () => {
    const { isOwnStorageUrl } = await import("./storage");
    expect(isOwnStorageUrl("http://test-bucket.s3.eu-west-2.amazonaws.com/media/image/abc.png")).toBe(false);
  });
});
