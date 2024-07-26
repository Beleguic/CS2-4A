const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const productSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    required: true
  },
  is_adult: {
    type: Boolean,
    default: false
  },
  reference: {
    type: String,
    required: true
  },
  tva: {
    type: Number,
    required: true
  },
  categories: [{
    type: String,
    ref: 'Category'
  }],
  stocks: [{
    type: String,
    ref: 'Stock'
  }]
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
