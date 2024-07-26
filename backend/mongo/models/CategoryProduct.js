const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoryProductSchema = new Schema({
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true }
});

module.exports = mongoose.model('CategoryProduct', categoryProductSchema);
