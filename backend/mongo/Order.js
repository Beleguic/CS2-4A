const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

module.exports = function (connection) {
  const OrderSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    user_id: { type: String, required: true, index: true },
    total_amount: { type: Number, required: true },
    status: { type: String, required: true, index: true },
    shipping_address: { type: String },
    billing_address: { type: String },
    payment_method: { type: String },
    created_at: { type: Date, default: Date.now, index: true },
    updated_at: { type: Date, default: Date.now },
    user: {
      id: { type: String },
      email: { type: String },
      username: { type: String },
      firstName: { type: String },
      lastName: { type: String }
    }
  });

  OrderSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
  });

  // Index pour les performances
  OrderSchema.index({ user_id: 1 });
  OrderSchema.index({ status: 1 });
  OrderSchema.index({ created_at: -1 });

  const Order = connection.model("Order", OrderSchema);
  
  return Order;
}; 