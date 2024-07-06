const path = require("path");
const Question = require(path.join(
  __dirname,
  "../data-services/QuestionsSchema"
));

const viewQuestion = async (req, res) => {
  try {
    console.log(req.params);
    const questions = await Question.find({ id: req.params.id });
    console.log(questions);
    res.send(questions);
  } catch (error) {
    console.error("Error fetching questions", error);
    res.status(500).send("Error fetching questions");
  }
};

module.exports = { viewQuestion };
