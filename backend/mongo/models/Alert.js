const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const alertSchema = new Schema({
  _id: { type: String, required: true }, // Utiliser _id comme clé primaire
  alert_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AlertType', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
