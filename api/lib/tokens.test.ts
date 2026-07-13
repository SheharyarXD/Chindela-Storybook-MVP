import { describe, it, expect } from "vitest";
import { generateToken, hashToken } from "./tokens";

describe("tokens", () => {
  it("generates a token whose hash matches hashToken(token)", () => {
    const { token, tokenHash } = generateToken();
    expect(hashToken(token)).toBe(tokenHash);
  });

  it("generates a sufficiently long, unpredictable raw token", () => {
    const { token } = generateToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/); // 32 random bytes, hex-encoded
  });

  it("never generates the same token twice in practice", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a.token).not.toBe(b.token);
    expect(a.tokenHash).not.toBe(b.tokenHash);
  });

  it("hashToken is deterministic for the same input", () => {
    expect(hashToken("same-input")).toBe(hashToken("same-input"));
  });

  it("hashToken output never reveals the input token", () => {
    const { token, tokenHash } = generateToken();
    expect(tokenHash).not.toContain(token);
  });
});
