// lib/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "expense-tracker";

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

/**
 * Cached client to prevent connection storm during dev hot reloads.
 * global.__mongo = { client, db }
 */
async function connectDB() {
  try {
    if (global.__mongo && global.__mongo.client && global.__mongo.db) {
      return global.__mongo.db;
    }

    const client = new MongoClient(uri, {
      // faster failure in dev so we see errors quickly
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });

    await client.connect(); // will throw if cannot connect
    const db = client.db(dbName);

    global.__mongo = { client, db };
    console.log(`[lib/mongodb] connected to ${db.databaseName}`);
    return db;
  } catch (err) {
    console.error(
      "[lib/mongodb] connect error:",
      err && err.stack ? err.stack : err
    );
    throw err; // rethrow so callers can respond accordingly
  }
}

export { connectDB };
