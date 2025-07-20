const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

module.exports = function (connection) {
  const CartSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    user_id: { type: String, required: true, index: true },
    items: [{ type: mongoose.Schema.Types.Mixed }],
    total_amount: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    user: {
      id: { type: String },
      email: { type: String },
      username: { type: String }
    }
  });

  CartSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
  });

  // Index pour les performances
  CartSchema.index({ user_id: 1 });

  const Cart = connection.model("Cart", CartSchema);
  
  return Cart;
}; 