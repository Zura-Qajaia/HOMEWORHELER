const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  firstName: String,
  lastName: String,
  role: {
    type: String,
    enum: ["admin", "user", "expert"],
    default: "user",
  },
  payment: { type: Boolean, default: false },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 18 },
  createdAt: { type: Date, default: Date.now },
  questions: [{ type: String, ref: "Question" }], // Reference to Question id
  maxQuestionsPerMonth: { type: Number, default: 13 },
  password: { type: String, required: true, minlength: 8, select: false },
});

userSchema.index({ email: "text" });

const User = mongoose.model("User", userSchema);

module.exports = User;
