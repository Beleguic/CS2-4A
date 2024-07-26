const mongoose = require('mongoose');
const { sendPromotionAlerts } = require('../../services/notificationService'); // Assurez-vous que ce chemin est correct

const productPromotionSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  start_at: { type: Date, default: Date.now },
  end_at: { type: Date, default: Date.now }
});

productPromotionSchema.post('save', async function (doc, next) {
  await sendPromotionAlerts(doc);
  next();
});

module.exports = mongoose.model('ProductPromotion', productPromotionSchema);
