const path = require("path");
const Question = require(path.join(
  __dirname,
  "../data-services/QuestionsSchema"
));

const viewQuestions = async (req, res) => {
  try {
    const questions = await Question.find(); // Fetch all questions from MongoDB
    console.log(questions);
    res.send(questions);
  } catch (error) {
    console.error("Error fetching questions", error);
    res.status(500).send("Error fetching questions");
  }
};

module.exports = { viewQuestions };
