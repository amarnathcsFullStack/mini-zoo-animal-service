
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function testUpdate() {
  try {
    console.log("Current animal:");

    let result = await sql`
      SELECT * FROM animals WHERE id = 1
    `;

    console.log(result);

    console.log("Updating bellySize...");

    result = await sql`
      UPDATE animals
      SET "bellySize" = "bellySize" + 1
      WHERE id = 1
      RETURNING *
    `;

    console.log("After update:");
    console.log(result);

    console.log("Checking database again:");

    result = await sql`
      SELECT * FROM animals WHERE id = 1
    `;

    console.log(result);

  } catch (error) {
    console.error("Update failed:");
    console.error(error);
  }
}

testUpdate();

