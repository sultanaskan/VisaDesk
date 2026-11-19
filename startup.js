import { runBootstrap } from "./scripts/bootstrap.js";

try {
  await runBootstrap();
  await import("./src/server.js");
} catch (error) {
  console.error("\n[startup] Fatal error starting application:");
  console.error(error);
  process.exit(1);
}
