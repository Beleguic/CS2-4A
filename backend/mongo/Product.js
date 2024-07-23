const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

module.exports = function (connection) {
  const ProductSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    description: { type: String },
    image: { type: String },
    is_active: { type: Boolean, default: true },
    is_adult: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    reference: { type: String },
    tva: { type: Number }
  });

  ProductSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
  });

  const Product = connection.model("Product", ProductSchema);
  
  return Product;
};