
const initSqlJs = require("sql.js");
const fs = require("fs");

const dbFile = "animals.db";

let db;

async function initializeDatabase() {
  const SQL = await initSqlJs({
    locateFile: () => require.resolve("sql.js/dist/sql-wasm.wasm")
  });

  // Open existing database or create a new one
  if (fs.existsSync(dbFile)) {
    const fileBuffer = fs.readFileSync(dbFile);
    db = new SQL.Database(fileBuffer);

    console.log("Existing SQLite database opened");
  } else {
    db = new SQL.Database();

    console.log("New SQLite database created");
  }

  // Create animals table
  db.run(`
    CREATE TABLE IF NOT EXISTS animals (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      age INTEGER NOT NULL,
      bellySize INTEGER NOT NULL
    )
  `);

  // Add Tiger if it doesn't already exist
  const existingAnimal = db.exec(
    "SELECT * FROM animals WHERE id = 1"
  );

  if (existingAnimal.length === 0) {
    db.run(`
      INSERT INTO animals
      (id, name, species, age, bellySize)
      VALUES (1, 'Tiger', 'Tiger', 5, 0)
    `);

    saveDatabase();
  }
}

function saveDatabase() {
  const data = db.export();

  fs.writeFileSync(
    dbFile,
    Buffer.from(data)
  );
}

function getAnimal(id) {
  const result = db.exec(
    "SELECT * FROM animals WHERE id = ?",
    [id]
  );

  if (result.length === 0) {
    return null;
  }

  const animal = result[0].values[0];

  return {
    id: animal[0],
    name: animal[1],
    species: animal[2],
    age: animal[3],
    bellySize: animal[4]
  };
}

function feedAnimal(id, amount) {
  db.run(
    `
    UPDATE animals
    SET bellySize = bellySize + ?
    WHERE id = ?
    `,
    [amount, id]
  );

  saveDatabase();

  return getAnimal(id);
}

module.exports = {
  initializeDatabase,
  getAnimal,
  feedAnimal
};

