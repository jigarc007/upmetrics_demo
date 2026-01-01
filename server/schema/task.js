const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  columnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Column' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  position: Number,
  priority: { type: String, enum: ['Low', 'Medium', 'High'] },
  dueDate: Date
}, { timestamps: true });
module.exports = mongoose.model('Task', TaskSchema);