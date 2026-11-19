import "dotenv/config";
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

async function main() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters. Set it in .env.");
  }

  await ensureDatabase();

  
    const prismaCli = "node_modules/prisma/build/index.js";

    run(
      process.execPath,
      [prismaCli, "generate"],
      "Generate Prisma Client"
    );

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


  console.log("\n[setup] Setup completed. Starting the API...");
}

main().catch((error) => {
  console.error("\n[setup] Automatic setup failed.");
  console.error(error.message);
  console.error(
    "\nCheck that MySQL Server is running and the DATABASE_URL username/password are correct. " +
    "The MySQL account must have permission to create the database and tables."
  );
  process.exit(1);
});
