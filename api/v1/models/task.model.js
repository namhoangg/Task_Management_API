const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema(
  {
    title: String,
    status: String,
    timeStart: Date,
    timeFinish: Date,
    createdBy: String,
    listUsers: [String],
    taskParentId: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: Date,
  },
  {
    timestamps: true,
  }
);
const Task = mongoose.model("Task", taskSchema, "tasks");
module.exports = Task;
