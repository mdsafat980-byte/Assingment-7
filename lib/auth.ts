import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const databasePath =
  process.env.BETTER_AUTH_DB_PATH ??
  (process.env.NODE_ENV === "production"
    ? path.join(os.tmpdir(), "bazar-dor-auth.sqlite")
    : path.join(process.cwd(), "data", "auth.sqlite"));
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const globalForAuth = globalThis as typeof globalThis & {
  bazarAuthDatabase?: Database.Database;
};

const database =
  globalForAuth.bazarAuthDatabase ??
  new Database(databasePath);

database.pragma("foreign_keys = ON");
database.exec(`
  CREATE TABLE IF NOT EXISTS "user" (
    "id" text NOT NULL PRIMARY KEY,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "emailVerified" integer NOT NULL,
    "image" text,
    "createdAt" date NOT NULL,
    "updatedAt" date NOT NULL
  );
  CREATE TABLE IF NOT EXISTS "session" (
    "id" text NOT NULL PRIMARY KEY,
    "expiresAt" date NOT NULL,
    "token" text NOT NULL UNIQUE,
    "createdAt" date NOT NULL,
    "updatedAt" date NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "account" (
    "id" text NOT NULL PRIMARY KEY,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" date,
    "refreshTokenExpiresAt" date,
    "scope" text,
    "password" text,
    "createdAt" date NOT NULL,
    "updatedAt" date NOT NULL
  );
  CREATE TABLE IF NOT EXISTS "verification" (
    "id" text NOT NULL PRIMARY KEY,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expiresAt" date NOT NULL,
    "createdAt" date NOT NULL,
    "updatedAt" date NOT NULL
  );
`);

if (process.env.NODE_ENV !== "production") {
  globalForAuth.bazarAuthDatabase = database;
}

const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  (process.env.NODE_ENV !== "production" || process.env.NEXT_PHASE === "phase-production-build"
    ? "local-development-secret-change-this-before-deploying-123456"
    : undefined);

if (!authSecret) {
  throw new Error("BETTER_AUTH_SECRET must be configured before production deployment.");
}

export const auth = betterAuth({
  database,
  secret: authSecret,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  emailAndPassword: { enabled: true },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
});
