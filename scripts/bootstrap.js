import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import mysql from "mysql2/promise";

function run(command, args, label) {
  console.log(`\n[setup] ${label}...`);

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    env: process.env
  });

  if (result.error) throw result.error;

  if (result.status !== 0) {
    throw new Error(
      `${label} failed with exit code ${result.status ?? "unknown"}.`
    );
  }
}

function getDatabaseConfig(connectionString) {
  const url = new URL(connectionString);
  if (url.protocol !== "mysql:") {
    throw new Error("DATABASE_URL must use the mysql:// protocol.");
  }
  const database = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  if (!database) throw new Error("DATABASE_URL must include a database name.");
  return {
    host: url.hostname || "localhost",
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database
  };
}

async function ensureDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add your MySQL connection details to .env.");
  }

  const config = getDatabaseConfig(process.env.DATABASE_URL);
  console.log(`[setup] Connecting to MySQL at ${config.host}:${config.port}...`);
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    ssl: {
      minVersion: "TLSv1.2"
    },
    connectTimeout: 10000
  });

  try {
    const [rows] = await connection.execute(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
      [config.database]
    );
    if (rows.length === 0) {
      const safeName = config.database.replace(/`/g, "``");
      await connection.query(
        `CREATE DATABASE \`${safeName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`[setup] Created database "${config.database}".`);
    } else {
      console.log(`[setup] Database "${config.database}" already exists.`);
    }
  } finally {
    await connection.end();
  }
}

export async function runBootstrap() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters. Set it in .env.");
  }

  await ensureDatabase();

  const prismaCli = "node_modules/prisma/build/index.js";
  const prismaClientFile = path.resolve("node_modules/.prisma/client/index.js");

  // Only generate Prisma Client if it hasn't been generated yet (prevents Windows EPERM file locks)
  if (!fs.existsSync(prismaClientFile)) {
    run(
      process.execPath,
      [prismaCli, "generate"],
      "Generate Prisma Client"
    );
  } else {
    console.log("\n[setup] Prisma Client already generated, skipping...");
  }

  // Skip slow schema push & seeding in Passenger production mode
  if (process.env.NODE_ENV !== "production") {
    run(
      process.execPath,
      [prismaCli, "db", "push", "--skip-generate"],
      "Synchronize database tables"
    );

    run(
      process.execPath,
      ["prisma/seed.js"],
      "Create initial admin and demo catalog"
    );
  }

  console.log("\n[setup] Setup completed. Starting the API...");
}

// Run immediately if executed directly via `npm run setup`
const isDirectRun = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (isDirectRun) {
  runBootstrap().catch((error) => {
    console.error("\n[setup] Automatic setup failed.");
    console.error(error.message);
    process.exit(1);
  });
}
