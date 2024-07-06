const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  subject: { type: String, required: true, index: true },
  topic: { type: String, required: true, index: true },
  questionText: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
    index: true,
  },
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

questionSchema.index({ questionText: "text" });

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
