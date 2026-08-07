
require("dotenv").config();

const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000
});

async function testDatabase() {
  try {
    console.log("Connecting to Neon...");

    await client.connect();

    console.log("Connected to Neon PostgreSQL!");

    const result = await client.query("SELECT NOW()");

    console.log("Database time:", result.rows[0]);

    await client.end();

    console.log("Connection closed.");
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
  }
}

testDatabase();

