const mongoose = require('mongoose');
const ColumnSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  position: { type: Number, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Column', ColumnSchema);