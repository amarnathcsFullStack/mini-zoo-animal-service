
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function testDatabase() {
  try {
    console.log("Connecting to Neon...");

    const result = await sql`SELECT version()`;

    console.log("Connected to Neon PostgreSQL!");
    console.log(result[0]);

  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
  }
}

testDatabase();

