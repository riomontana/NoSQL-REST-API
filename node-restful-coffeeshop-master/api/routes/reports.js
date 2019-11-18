const express = require('express');
const router = express.Router(); // gives capabilities to conveniently handle different routes
const mongoose = require('mongoose');
module.exports = router;

const Employee = require('../models/employee'); //Employee schema
const Customer = require('../models/customer'); //Customer schema 
const Order = require('../models/order'); // Order schema


//get employees within daterange  
router.get('/employees/', (req, res, next) => {
    var startDateRange = req.body.startDateRange;
    var endDateRange = req.body.endDateRange;
    Employee.find({
            startDate: {
                $gte: startDateRange,
                $lte: endDateRange
            }
        })
        .sort({
            startDate: 1
        })
        .select('_id name ssn startDate')
        .then(docs => {
            console.log("From database:\n" + docs);
            res.status(200).json({
                employees: docs,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})

//get customers registered within daterange
router.get('/customers/', (req, res, next) => {
    var startDateRange = req.body.startDateRange;
    var endDateRange = req.body.endDateRange;
    Customer.find({
            member_since: {
                $gte: startDateRange,
                $lte: endDateRange
            }
        })
        .sort({
            member_since: 1
        })
        .select('_id name ssn member_since loyalty_coffee')
        .then(docs => {
            console.log("From database:\n" + docs);
            res.status(200).json({
                customers: docs,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})

//get all orders within daterange  
router.get('/allOrdersWithinDateRange/', (req, res, next) => {
    var startDateRange = req.body.startDateRange;
    var endDateRange = req.body.endDateRange;
    Order.find({
            date: {
                $gte: startDateRange,
                $lte: endDateRange
            }
        })
        .sort({
            date: 1
        })
        .select('date _id cashier customer items')
        .then(docs => {
            console.log("From database:\n" + docs);
            res.status(200).json({
                ordersWithinDateRange: docs,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})

//get orders for one or more item within daterange
router.get('/orders/', (req, res, next) => {
    var startDateRange = req.body.startDateRange;
    var endDateRange = req.body.endDateRange;
    Order.find({
            date: {
                $gte: startDateRange,
                $lte: endDateRange
            }
        })
        .sort({
            date: 1
        })
        .select('_id date cashier customer items ')
        .then(docs => {
            console.log("From database:\n" + docs);
            res.status(200).json({
                orders: docs,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})

//get orders from specific employee within daterange  
router.get('/ordersByEmployeeWithinDateRange/', (req, res, next) => {
    var employeeId = req.body.employeeId;
    var startDateRange = req.body.startDateRange;
    var endDateRange = req.body.endDateRange;

    Order.find({
            cashier: employeeId,
            date: {
                $gte: startDateRange,
                $lte: endDateRange
            }
        })
        .sort({
            date: 1
        })
        .select('date _id cashier customer items')
        .then(docs => {
            console.log("From database:\n" + docs);
            res.status(200).json({
                ordersByEmployeeWithinDateRange: docs,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})

//get orders from customers with the same occupation 
router.get('/ordersByCustomersWithSameOccupation/', (req, res, next) => {
    var occupation = req.body.occupation;
    Order.find({
            occupation: occupation
        })
        .select('date _id cashier customer items')
        .then(docs => {
            console.log("From database:\n" + docs);
            res.status(200).json({
                ordersByCustomersWithSameOccupation: docs,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})
