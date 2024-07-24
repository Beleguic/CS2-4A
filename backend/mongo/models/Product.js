const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true, default: 0 },
  description: { type: String, required: true },
  image: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  is_adult: { type: Boolean, default: false },
  reference: { type: String, required: true },
  tva: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  categoryProducts: [{ type: Schema.Types.ObjectId, ref: 'CategoryProduct' }],
  stocks: [{ type: Schema.Types.ObjectId, ref: 'Stock' }],
  productPromotions: [{ type: Schema.Types.ObjectId, ref: 'ProductPromotion' }],
  promotionCodes: [{ type: Schema.Types.ObjectId, ref: 'PromotionCode' }]
});

module.exports = mongoose.model('Product', productSchema);
