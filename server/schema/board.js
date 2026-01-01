const mongoose = require('mongoose');
const BoardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['private', 'public'], default: 'private' }
}, { timestamps: true });
module.exports = mongoose.model('Board', BoardSchema);