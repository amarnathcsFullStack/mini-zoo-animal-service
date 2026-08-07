// run `node index.js` in the terminal
const express = require("express");
const Database = require("better-sqlite3");

const app = express();

const db = new Database("animals.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS animals (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    age INTEGER NOT NULL,
    bellySize INTEGER NOT NULL
  )
`);
const existingAnimal = db
  .prepare("SELECT * FROM animals WHERE id = ?")
  .get(1);

if (!existingAnimal) {
  db.prepare(`
    INSERT INTO animals (id, name, species, age, bellySize)
    VALUES (?, ?, ?, ?, ?)
  `).run(1, "Tiger", "Tiger", 5, 0);
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const animal = {
  name: "Tiger",
  species: "Tiger",
  age: 5,
  bellySize: 3
};
app.get("/", (req, res) => {
  res.send("Welcome to Animal Service");
});

app.get("/animals", (req, res) => {
  res.json(animal);
});

app.post("/animals/1/feed", async (req, res) => {
  if (animal.bellySize >= 10) {
    return res.status(400).json({
      message: "Tiger is already full"
    });
  }

  try {
    console.log("Calling Food Service...");

    const foodResponse = await fetch(
      "https://mini-zoo-food-service.onrender.com/feed",
      {
        method: "POST"
      }
    );

    if (!foodResponse.ok) {
      console.error(
        "Food Service returned:",
        foodResponse.status
      );

      return res.status(503).json({
        message: "Food Service is unavailable"
      });
    }

    const food = await foodResponse.json();

    console.log("Food received:", food);

    animal.bellySize += food.amount;

    res.json({
      message: `Tiger was fed ${food.food}`,
      animal: animal
    });

  } catch (error) {
    console.error("Food Service call failed:", error);

    res.status(503).json({
      message: "Food Service is unavailable"
    });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Animal Service is running on port ${PORT}`);
});
