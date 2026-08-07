
// run `node index.js` in the terminal

const express = require("express");
const initSqlJs = require("sql.js");
const fs = require("fs");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

async function startServer() {
  // Initialize SQLite
  const SQL = await initSqlJs({
    locateFile: () => require.resolve("sql.js/dist/sql-wasm.wasm")
  });

  const dbFile = "animals.db";

  let db;

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

  // Save SQLite database to animals.db
  function saveDatabase() {
    const data = db.export();
    fs.writeFileSync(dbFile, Buffer.from(data));
  }

  // GET /
  app.get("/", (req, res) => {
    res.send("Welcome to Animal Service");
  });

  // GET /animals
  app.get("/animals", (req, res) => {
    const result = db.exec(
      "SELECT * FROM animals WHERE id = 1"
    );

    const animal = result[0].values[0];

    res.json({
      id: animal[0],
      name: animal[1],
      species: animal[2],
      age: animal[3],
      bellySize: animal[4]
    });
  });


  // POST /animals/1/feed
  app.post("/animals/1/feed", async (req, res) => {
    // Get current Tiger from database
    const result = db.exec(
      "SELECT * FROM animals WHERE id = 1"
    );

    const animal = result[0].values[0];

    const bellySize = animal[4];

    // Check if Tiger is already full
    if (bellySize >= 10) {
      return res.status(400).json({
        message: "Tiger is already full"
      });
    }

    try {
      console.log("Calling Food Service...");

      // Call Food Service
      const foodResponse = await fetch(
        "https://mini-zoo-food-service.onrender.com/feed",
        {
          method: "POST"
        }
      );

      // Food Service returned an error
      if (!foodResponse.ok) {
        console.error(
          "Food Service returned:",
          foodResponse.status
        );

        return res.status(503).json({
          message: "Food Service is unavailable"
        });
      }

      // Get food information
      const food = await foodResponse.json();

      console.log("Food received:", food);

      // Update bellySize in SQLite
      db.run(
        `
        UPDATE animals
        SET bellySize = bellySize + ?
        WHERE id = 1
        `,
        [food.amount]
      );

      // Save updated database to animals.db
      saveDatabase();

      // Get updated Tiger from database
      const updatedResult = db.exec(
        "SELECT * FROM animals WHERE id = 1"
      );

      const updatedAnimal = updatedResult[0].values[0];

      res.json({
        message: `Tiger was fed ${food.food}`,
        animal: {
          id: updatedAnimal[0],
          name: updatedAnimal[1],
          species: updatedAnimal[2],
          age: updatedAnimal[3],
          bellySize: updatedAnimal[4]
        }
      });

    } catch (error) {
      console.error(
        "Food Service call failed:",
        error
      );

      res.status(503).json({
        message: "Food Service is unavailable"
      });
    }
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(
      `Animal Service is running on port ${PORT}`
    );
  });
}

startServer();

