const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../data-services/UserSchema.js");
const Question = require("../data-services/QuestionsSchema.js");

const deleteoneUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await User.deleteOne({ id: id });

    if (result.deletedCount === 1) {
      res
        .status(200)
        .json({ message: `User with id ${id} deleted successfully.` });
    } else {
      res.status(404).json({ message: `User with id ${id} not found.` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteoneQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Question.deleteOne({ id: id });

    if (result.deletedCount === 1) {
      res
        .status(200)
        .json({ message: `Question with id ${id} deleted successfully.` });
    } else {
      res.status(404).json({ message: `Question with id ${id} not found.` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const insertoneUser = async (req, res) => {
  try {
    const data = req.body;

    const newUser = new User(data);
    await newUser.save();
    res
      .status(201)
      .send({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error inserting user", error);
    res.status(500).send({ message: "Error inserting user", error });
  }
};

const insertoneQuestion = async (req, res) => {
  try {
    const data = req.body;
    const newQuestion = new Question(data);
    await newQuestion.save();
    res.status(201).send({
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    console.error("Error inserting question", error);
    res.status(500).send({ message: "Error inserting question", error });
  }
};

const findSimilarQuestions = async (newQuestionText) => {
  try {
    const similarQuestions = await Question.find(
      {
        $text: { $search: newQuestionText },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({
        score: { $meta: "textScore" },
      })
      .limit(5);

    return similarQuestions;
  } catch (error) {
    console.error("Error finding similar questions:", error);
    return [];
  }
};

const createSendToken = (user, statusCode, req, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password!" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    createSendToken(user, 200, req, res);
  } catch (error) {
    console.error("Error logging in", error);
    res.status(500).json({ message: "An error occurred.", error });
  }
};

const recentQuestion = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "You are not logged in!" });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    const qu = user.questions.map((el) => Number(el));
    console.log(qu);
    let temp = [];

    for (let i = 0; i < qu.length; i++) {
      const val = await Question.findOne({ id: qu[i] });
      console.log(val);
      temp.push(val);
    }

    res.status(200).json({
      status: "success",
      data: {
        temp,
      },
    });
  } catch (error) {
    console.error("Error in recentQuestion middleware:", error);
    res.status(401).json({ message: "You are not logged in!" });
  }
};

module.exports = {
  recentQuestion,
  deleteoneUser,
  deleteoneQuestion,
  insertoneUser,
  insertoneQuestion,
  findSimilarQuestions,
  login,
};
