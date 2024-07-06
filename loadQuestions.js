const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "environ.env") });

// Verify dotenv loaded correctly
console.log("Environment variables loaded:", process.env);

// Check resolved path to .env file
console.log(
  "Resolved path to .env file:",
  path.resolve(__dirname, "environ.env")
);

// Check MongoDB URL
console.log("MongoDB URL:", process.env.MONGODB_URL);

// Adjust the path to QuestionsSchema.js as needed
const Question = require(path.resolve(
  __dirname,
  "./../Backend/data-services/QuestionsSchema.js"
));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB connected");

    // Example: Read questions data from JSON file
    const questionsData = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "./data/data.json"), "utf-8")
    );

    // Assign IDs to questionsData
    questionsData.forEach((question, index) => {
      question.id = index + 1; // Assigning IDs starting from 1
    });

    // Example: Insert questions into MongoDB
    await Question.insertMany(questionsData);

    console.log("Questions loaded successfully");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
  });
