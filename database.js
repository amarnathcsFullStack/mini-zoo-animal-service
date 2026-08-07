
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

// Get one animal by ID
async function getAnimal(id) {
  const result = await sql`
    SELECT
      id,
      name,
      species,
      age,
      "bellySize"
    FROM animals
    WHERE id = ${id}
  `;

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

// Increase an animal's belly size
async function updateBellySize(id, amount) {
  const result = await sql`
    UPDATE animals
    SET "bellySize" = "bellySize" + ${amount}
    WHERE id = ${id}
    RETURNING
      id,
      name,
      species,
      age,
      "bellySize"
  `;

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

module.exports = {
  getAnimal,
  updateBellySize
};

