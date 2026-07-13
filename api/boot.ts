import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { rateLimit, sameOrigin, securityHeaders } from "./lib/security";
import { initAdminBootstrap } from "./lib/bootstrap";
import { handleStripeWebhook } from "./webhooks/stripe";
import { checkHealth } from "./lib/health";

initAdminBootstrap();

const app = new Hono<{ Bindings: HttpBindings }>();

app.use("*", securityHeaders);
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
// Plain REST endpoint (not tRPC) for load balancer / orchestrator health
// checks -- deliberately outside rateLimit/sameOrigin so frequent automated
// probes never get throttled or blocked. Kept under /api/ (rather than a bare
// /health) so it's reachable through the Vite dev-server proxy in local dev too.
app.get("/api/health", async (c) => {
  const health = await checkHealth();
  return c.json(health, health.ok ? 200 : 503);
});
// Registered ahead of /api/trpc/* deliberately: Stripe's webhook POSTs have no
// browser Origin header and aren't a tRPC envelope, so this must not go
// through sameOrigin/rateLimit or the tRPC handler.
app.post("/api/webhooks/stripe", handleStripeWebhook);
app.use("/api/trpc/*", rateLimit, sameOrigin);
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
