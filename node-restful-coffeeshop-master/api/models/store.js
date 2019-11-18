const mongoose = require('mongoose');

const storeSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    currency: String,
    name: String,
    location: String,
    menu: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
        }
    }]
});

module.exports = mongoose.model('Store', storeSchema);