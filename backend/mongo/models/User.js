const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  _id: { type: String, required: true }, // Utiliser _id comme clé primaire
  email: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  isSubscribedToNewsletter: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  is_verified: { type: Boolean, default: false },
  verification_token: { type: String, required: false },
  login_attempts: { type: Number, default: 0 },
  lock_until: { type: Date, required: false },
  reset_password_token: { type: String, required: false },
  reset_password_expires: { type: Date, required: false },
  password_last_changed: { type: Date, required: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  alerts: [{ type: Schema.Types.ObjectId, ref: 'Alert' }],
  newsletters: [{ type: Schema.Types.ObjectId, ref: 'Newsletter' }]
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('findOneAndUpdate', async function(next) {
  if (!this._update.password) return next();
  const salt = await bcrypt.genSalt(10);
  this._update.password = await bcrypt.hash(this._update.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
