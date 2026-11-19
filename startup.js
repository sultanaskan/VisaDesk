async function startApplication() {
  try {
    // Passenger's loader may require this file. Keep static imports out of its
    // module graph, then load the ES modules after the CommonJS loader returns.
    const { runBootstrap } = await import("./scripts/bootstrap.js");
    await runBootstrap();
    await import("./src/server.js");
  } catch (error) {
    console.error("\n[startup] Fatal error starting application:");
    console.error(error);
    process.exit(1);
  }
}

startApplication();