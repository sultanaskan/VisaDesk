import "dotenv/config";
import app from "./app.js";
import { prisma } from "./config/prisma.js";

const port = Number(process.env.PORT || 4000);

/**
 * Start the application server. This function checks for required environment variables, connects to the database, and starts listening for incoming requests. It also handles graceful shutdown on SIGINT signal.
 */
async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set and contain at least 32 characters.");
  }
  await prisma.$connect();
  app.listen(port, () => console.log(`Visa Agency API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
