// run `node index.js` in the terminal
const express = require("express");

const app = express();

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

  const foodResponse = await fetch(
    "https://mini-zoo-food-service.onrender.com/feed",
    {
      method: "POST"
    }
  );

  const food = await foodResponse.json();

  animal.bellySize += food.amount;

  res.json({
    message: `Tiger was fed ${food.food}`,
    animal: animal
  });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Animal Service is running on port ${PORT}`);
});
