const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true // This adds createdAt and updatedAt, _id is automatic
});


module.exports = mongoose.model('Message', messageSchema);