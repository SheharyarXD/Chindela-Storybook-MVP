import { describe, it, expect } from "vitest";
import {
  welcomeEmail,
  passwordResetEmail,
  subscriptionConfirmationEmail,
  paymentFailedEmail,
  parentNotificationEmail,
} from "./emailTemplates";

describe("email templates", () => {
  it("escapes HTML in a user-controlled name so it cannot inject markup", () => {
    const malicious = '<img src=x onerror="alert(1)">';
    const { html } = welcomeEmail(malicious, "https://example.com/verify?token=abc");
    expect(html).not.toContain("<img src=x onerror");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  it("keeps the verification/reset link as a real href, unescaped", () => {
    const url = "https://example.com/reset-password?token=deadbeef";
    const { html } = passwordResetEmail("Parent", url);
    expect(html).toContain(`href="${url}"`);
  });

  it("escapes child name and age group name in subscription confirmation", () => {
    const { html } = subscriptionConfirmationEmail({
      name: "Parent",
      childName: "<script>alert(1)</script>",
      ageGroupName: "5-7 years",
      duration: 3,
      totalPrice: "6.00",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes a failure reason string that could contain arbitrary text", () => {
    const { html } = paymentFailedEmail({ name: "Parent", reason: '"><svg onload=alert(1)>' });
    expect(html).not.toContain("<svg onload=alert(1)>");
  });

  it("escapes title/message in the generic parent notification template", () => {
    const { html } = parentNotificationEmail({
      name: "Parent",
      title: "<b>Alert</b>",
      message: "click <a href=javascript:alert(1)>here</a>",
    });
    expect(html).not.toContain("<b>Alert</b>");
    expect(html).not.toContain("<a href=javascript:alert(1)>");
  });
});
