const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');

const alertSchema = new Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  alert_type_id: {
    type: String,
    ref: 'AlertType',
    required: true
  },
  product_id: {
    type: String,
    ref: 'Product',
    required: false
  },
  category_id: {
    type: String,
    ref: 'Category',
    required: false
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

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;

