const mongoose = require('mongoose');
const { sendRestockAlerts } = require('../../services/notificationService'); 
const { v4: uuidv4 } = require('uuid');

const stockSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  quantity: { type: Number, required: true, default: 0 },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  status: { type: String, required: false },
  difference: { type: String, required: false },
  created_at: { type: Date, default: Date.now }
});

stockSchema.post('save', async function (doc, next) {
  await sendRestockAlerts(doc);
  next();
});

module.exports = mongoose.model('Stock', stockSchema);
