const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

module.exports = function (connection) {
  const CategorySchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true, index: true },
    description: { type: String },
    is_active: { type: Boolean, default: true, index: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    products_count: { type: Number, default: 0 },
    products: [{
      id: { type: String },
      name: { type: String },
      price: { type: Number },
      is_active: { type: Boolean }
    }]
  });

  CategorySchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
  });

  // Index pour la recherche textuelle
  CategorySchema.index({ name: 'text', description: 'text' });

  const Category = connection.model("Category", CategorySchema);
  
  return Category;
}; 