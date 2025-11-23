import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import sessionsRoutes from "./routes/sessions";
import votesRoutes from "./routes/votes";
import verifyRoutes from "./routes/verify";
import auditRoutes from "./routes/audit";

export const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
});

// Register plugins
app.register(cors, {
  origin: process.env.CORS_ORIGIN || "*",
});

app.register(helmet);

app.register(swagger, {
  openapi: {
    info: {
      title: "Blockchain Voting Verification API",
      description: "API for blockchain-based vote verification and audit",
      version: "1.0.0",
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:3006",
      },
    ],
    tags: [
      { name: "sessions", description: "Voting session management" },
      { name: "votes", description: "Vote submission and commitment" },
      { name: "verify", description: "Verification endpoints" },
      { name: "audit", description: "Audit trail queries" },
    ],
  },
});

app.register(swaggerUi, {
  routePrefix: "/docs",
});

// Health check
app.get("/health", async () => ({ status: "healthy", service: "blockchain-service" }));

app.get("/ready", async () => {
  // Check ethereum connection
  const { ethereumService } = await import("./services/ethereum");
  const connected = await ethereumService.isConnected();
  return { status: connected ? "ready" : "not ready", ethereum: connected };
});

// Register routes
app.register(sessionsRoutes, { prefix: "/api/v1/sessions" });
app.register(votesRoutes, { prefix: "/api/v1/votes" });
app.register(verifyRoutes, { prefix: "/api/v1/verify" });
app.register(auditRoutes, { prefix: "/api/v1/audit" });

export default app;
