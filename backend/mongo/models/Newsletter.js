const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;

const newsletterSchema = new Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  user_id: {
    type: String,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Newsletter', newsletterSchema);
