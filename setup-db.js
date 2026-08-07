
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    console.log("Connecting to Neon...");

    await sql`
      CREATE TABLE IF NOT EXISTS animals (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        species TEXT NOT NULL,
        age INTEGER NOT NULL,
        "bellySize" INTEGER NOT NULL
      )
    `;

    console.log("Animals table created successfully.");

    const existingAnimal = await sql`
      SELECT * FROM animals WHERE id = 1
    `;

    if (existingAnimal.length === 0) {
      await sql`
        INSERT INTO animals
          (id, name, species, age, "bellySize")
        VALUES
          (1, 'Tiger', 'Tiger', 5, 0)
      `;

      console.log("Tiger inserted successfully.");
    } else {
      console.log("Tiger already exists.");
    }

    const animals = await sql`
      SELECT * FROM animals
    `;

    console.log("Animals in database:");
    console.log(animals);

  } catch (error) {
    console.error("Database setup failed:");
    console.error(error);
  }
}

setupDatabase();

