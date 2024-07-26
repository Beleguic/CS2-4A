const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const alertTypeSchema = new Schema({
  type: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('AlertType', alertTypeSchema);
