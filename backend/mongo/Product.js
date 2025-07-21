const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

module.exports = function (connection) {
  const ProductSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    description: { type: String },
    image: { type: String },
    is_active: { type: Boolean, default: true, index: true },
    is_adult: { type: Boolean, default: false, index: true },
    reference: { type: String },
    tva: { type: Number },
    brand: { type: String, index: true },
    created_at: { type: Date, default: Date.now, index: true },
    updated_at: { type: Date, default: Date.now },
    // Relations dénormalisées
    categories: [{
      id: { type: String },
      name: { type: String },
      description: { type: String }
    }],
    stock: {
      quantity: { type: Number, default: 0 },
      alert_threshold: { type: Number, default: 10 },
      is_low_stock: { type: Boolean, default: false }
    },
    promotions: [{
      id: { type: String },
      discount_percentage: { type: Number },
      start_date: { type: Date },
      end_date: { type: Date },
      is_active: { type: Boolean, default: true }
    }],
    has_active_promotion: { type: Boolean, default: false },
    final_price: { type: Number }
  });

  ProductSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
  });

  // Index pour la recherche textuelle et les performances
  ProductSchema.index({ name: 'text', description: 'text' });
  ProductSchema.index({ is_active: 1 });
  ProductSchema.index({ is_adult: 1 });
  ProductSchema.index({ price: 1 });
  ProductSchema.index({ brand: 1 });
  ProductSchema.index({ created_at: -1 });
  ProductSchema.index({ 'categories.id': 1 });
  ProductSchema.index({ has_active_promotion: 1 });

  const Product = connection.model("Product", ProductSchema);
  
  return Product;
};