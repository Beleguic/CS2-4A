const mongoose = require('mongoose');
const { sendPromotionCodeAlerts } = require('../../services/notificationService'); // Assurez-vous que ce chemin est correct

const promotionCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  reduction: { type: Number, required: true, min: 1, max: 100 },
  start_at: { type: Date, required: false },
  end_at: { type: Date, required: false },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false }
});

promotionCodeSchema.post('save', async function (doc, next) {
  await sendPromotionCodeAlerts(doc);
  next();
});

module.exports = mongoose.model('PromotionCode', promotionCodeSchema);
