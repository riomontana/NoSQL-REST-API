const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    ssn: String,
    address: String,
    current_role: String,
    startDate: Date,
    work_percent: Number, 
    work_history: [{
        companyName: String,
        position: String, 
        startDate: Date,
        endDate: Date,
        work_percent: Number 
    }],
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    }
});

module.exports = mongoose.model('Employee', employeeSchema);