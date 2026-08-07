
// run `node index.js` in the terminal

const express = require("express");

const {
  initializeDatabase,
  getAnimal,
  feedAnimal
} = require("./database");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// GET /
app.get("/", (req, res) => {
  res.send("Welcome to Animal Service");
});

// GET /animals
app.get("/animals", (req, res) => {
  const animal = getAnimal(1);

  if (!animal) {
    return res.status(404).json({
      message: "Animal not found"
    });
  }

  res.json(animal);
});

// POST /animals/1/feed
app.post("/animals/1/feed", async (req, res) => {
  const animal = getAnimal(1);

  if (!animal) {
    return res.status(404).json({
      message: "Animal not found"
    });
  }

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

    const updatedAnimal = feedAnimal(
      1,
      food.amount
    );

    res.json({
      message: `Tiger was fed ${food.food}`,
      animal: updatedAnimal
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

// Initialize database first, then start server
initializeDatabase()
  .then(() => {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(
        `Animal Service is running on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "Database initialization failed:",
      error
    );
  });

