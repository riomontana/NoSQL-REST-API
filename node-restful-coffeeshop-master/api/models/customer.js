const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    barcode: String,//??
    ssn: String,
    country: String,
    member_since: Date,
    occupation: String,
    loyalty_coffee: Number
});

module.exports = mongoose.model('Customer', customerSchema);