const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsletterSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,  // Change to String
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Newsletter', newsletterSchema);
