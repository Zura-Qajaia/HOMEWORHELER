const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const User = require("./data-services/UserSchema.js");
const { viewQuestions } = require("./routers/viewQuestions.js");
const { viewQuestion } = require("./routers/viewQuestion.js");
const pugTemplate = require("./routers/pugtemplate.js");
const {
  deleteoneUser,
  insertoneUser,
  insertoneQuestion,
  findSimilarQuestions,
  recentQuestion,
} = require("./controllers/dataController.js");
const {
  protect,
  signup,
  restrictTo,
  login,
  isLoggedin,
  logout,
} = require("./controllers/authController.js");

dotenv.config({ path: "./environ.env" });

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Welcome to my server");
});

app.get("/questions", protect, restrictTo("admin", "expert"), (req, res) => {
  console.log("Protected route /questions accessed");
  viewQuestions(req, res);
});

app.get("/question/:id", protect, (req, res) => {
  console.log("Protected route /question/:id accessed");
  viewQuestion(req, res);
});

app.delete("/deleteuser/:id", protect, restrictTo("admin"), (req, res) => {
  console.log("Protected route /deleteuser/:id accessed");
  deleteoneUser(req, res);
});

app.post("/signup", signup, (req, res) => {
  console.log("/insertuser accessed");
  insertoneUser(req, res);
});

app.post("/login", login, (req, res) => {
  console.log("/login accessed");
});

app.get("/logout", logout, (req, res) => {
  console.log("/logout accessed");
});

app.post("/insertquestion", protect, (req, res) => {
  console.log("Protected route /insertquestion accessed");
  insertoneQuestion(req, res);
});

app.get("/recent", protect, (req, res) => {
  console.log("Protected route /insertquestion accessed");
  recentQuestion(req, res);
});

app.post("/search-similar", async (req, res) => {
  console.log("Protected route /search-similar accessed");
  const newQuestionText = req.body.questionText;

  if (!newQuestionText) {
    return res.status(400).json({ error: "Question text is required" });
  }

  const similarQuestions = await findSimilarQuestions(newQuestionText);
  res.json(similarQuestions);
});

app.get("*", pugTemplate);

app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);
  res.status(500).send("Something broke!");
});

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
  });
