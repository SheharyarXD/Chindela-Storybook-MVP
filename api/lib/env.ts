import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  sessionSecret: required("SESSION_SECRET"),
  adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "",
  adminBootstrapToken: process.env.ADMIN_BOOTSTRAP_TOKEN?.trim() ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() ?? "",
  // "gemini-2.5-flash" (the old default) was retired for new API keys as of
  // this writing -- "gemini-flash-latest" is a Google-maintained alias that
  // always points at the current recommended flash model, so it won't go
  // stale the same way a pinned version number eventually will.
  geminiModel: process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY?.trim() ?? "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY?.trim() ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "",
  appUrl: process.env.APP_URL?.trim() || "http://localhost:3000",
  awsRegion: process.env.AWS_REGION?.trim() ?? "",
  awsS3Bucket: process.env.AWS_S3_BUCKET?.trim() ?? "",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? "",
  resendApiKey: process.env.RESEND_API_KEY?.trim() ?? "",
  emailFrom: process.env.EMAIL_FROM?.trim() || "Chindela Storybook <no-reply@chindela.example>",
};
