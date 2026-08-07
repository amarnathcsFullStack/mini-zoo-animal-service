
const express = require("express");

const {
  getAnimal,
  updateBellySize
} = require("./database");

const app = express();

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// GET /
app.get("/", (req, res) => {
  res.send("Welcome to Animal Service");
});

// GET /animals
app.get("/animals", async (req, res) => {
  try {
    const animal = await getAnimal(1);

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found"
      });
    }

    res.json(animal);

  } catch (error) {
    console.error("Failed to get animal:", error);

    res.status(500).json({
      message: "Failed to get animal"
    });
  }
});

// POST /animals/1/feed
app.post("/animals/1/feed", async (req, res) => {
  try {
    // Get current Tiger from PostgreSQL
    const animal = await getAnimal(1);

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found"
      });
    }

    // Check if Tiger is already full
    if (animal.bellySize >= 10) {
      return res.status(400).json({
        message: "Tiger is already full"
      });
    }

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

    // Update bellySize in PostgreSQL
    const updatedAnimal = await updateBellySize(
      1,
      food.amount
    );

    if (!updatedAnimal) {
      return res.status(500).json({
        message: "Failed to update animal"
      });
    }

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Animal Service is running on port ${PORT}`
  );
});
