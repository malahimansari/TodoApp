const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  task: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("task", taskSchema);
