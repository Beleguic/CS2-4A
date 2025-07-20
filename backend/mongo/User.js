const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

module.exports = function (connection) {
  const UserSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    role: { type: String, default: 'user', index: true },
    is_verified: { type: Boolean, default: false },
    isSubscribedToNewsletter: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    alerts_count: { type: Number, default: 0 },
    orders_count: { type: Number, default: 0 },
    total_spent: { type: Number, default: 0 },
    alerts: [{
      id: { type: String },
      type: { type: String },
      type_name: { type: String },
      product: {
        id: { type: String },
        name: { type: String },
        price: { type: Number }
      },
      category: {
        id: { type: String },
        name: { type: String }
      },
      is_active: { type: Boolean, default: true }
    }],
    recent_orders: [{
      id: { type: String },
      total_amount: { type: Number },
      status: { type: String },
      created_at: { type: Date }
    }]
  });

  UserSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
  });

  // Index pour la recherche
  UserSchema.index({ email: 1 });
  UserSchema.index({ username: 1 });
  UserSchema.index({ role: 1 });

  const User = connection.model("User", UserSchema);
  
  return User;
}; 