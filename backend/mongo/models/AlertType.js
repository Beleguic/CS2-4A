const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const alertTypeSchema = new Schema({
  _id: { type: String, required: true }, // Utiliser _id comme clé primaire
  type: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('AlertType', alertTypeSchema);
