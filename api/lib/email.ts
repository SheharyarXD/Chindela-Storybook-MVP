import { Resend } from "resend";
import { env } from "./env";

let instance: Resend | undefined;

// Lazy, like getStripe()/getS3() -- throws only when actually invoked with no
// key configured, so typecheck/build/tests stay green before Resend is set up.
function getResend(): Resend {
  if (!instance) {
    if (!env.resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    instance = new Resend(env.resendApiKey);
  }
  return instance;
}

export async function sendEmail(params: { to: string; subject: string; html: string; text?: string }) {
  if (!env.resendApiKey) {
    // Never throw for missing email config -- email delivery is best-effort
    // and must never block the auth/payment flow that triggered it.
    console.warn(`[email] RESEND_API_KEY not configured; skipping email "${params.subject}" to ${params.to}`);
    return { skipped: true } as const;
  }
  try {
    const result = await getResend().emails.send({
      from: env.emailFrom,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    return result;
  } catch (err) {
    console.error(`[email] Failed to send "${params.subject}" to ${params.to}:`, err);
    return { skipped: true } as const;
  }
}
