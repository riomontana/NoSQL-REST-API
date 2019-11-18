const express = require('express');
const router = express.Router(); // gives capabilities to conveniently handle different routes
const mongoose = require('mongoose');
const checkAuth = require('../middleware/auth-check');

const Customer = require('../models/customer'); //Customer schema

//get is a method that will handle all incoming get requests
router.get('/', (req, res, next) => {
    Customer.find()
        .select('_id name barcode ssn country member_since occupation loyalty_coffee  ')
        .exec()
        .then(docs => {
            console.log("From database:\n" + docs);
            const response = {

                count: docs.length,
                customers: docs.map(doc => {
                    return {
                        name: doc.name,
                        barcode: doc.barcode,
                        ssn: doc.ssn,
                        country: doc.country,
                        member_since: doc.member_since,
                        occupation: doc.occupation,
                        loyalty_coffee: doc.loyalty_coffee,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/customers/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

//method that will handle all incoming post requests
router.post('/', (req, res, next) => {
    const customer = new Customer({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        barcode: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        ssn: req.body.ssn,
        country: req.body.country,
        member_since: new Date(),
        occupation: req.body.occupation,
        loyalty_coffee: 0
    });
    customer.save().then(result => {
        console.log("From database:\n" + result);
        res.status(201).json({
            createdCustomer: {
                name: result.name,
                barcode: result.barcode,
                ssn: result.ssn,
                country: result.country,
                occupation: result.occupation,
                member_since: result.member_since,
                loyalty_coffee: result.loyalty_coffee,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/customers/' + result._id
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

/*** requests for individual customers ***/
router.get('/:customerId', (req, res, next) => {
    const id = req.params.customerId; // extract id from url
    Customer.findById(id)

    .select('name barcode ssn country member_since occupation loyalty_coffee')
        .exec()
        .then(doc => {
            console.log("From database:\n" + doc);
            if (doc) {
                res.status(200).json({
                    name: doc.name,
                    barcode: doc.barcode,
                    ssn: doc.ssn,
                    country: doc.country,
                    member_since: doc.member_since,
                    occupation: doc.occupation,
                    loyalty_coffee: doc.loyalty_coffee,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        description: 'Get all customers',
                        url: 'http://localhost:3000/customers/'
                    }
                });
            } else {
                res.status(404).json({
                    message: 'No such entry exists for the provided ID'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Invalid ID',
                error: err
            });
        });
});

router.patch('/:customerId', checkAuth, (req, res, next) => {
    const id = req.params.customerId;
    // Looping through the request body to check
    // which attributes that are to be patched
    const props = req.body;
    Customer.updateOne({ _id: id }, props)
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Customer updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/customers/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:customerId', checkAuth, (req, res, next) => {
    const id = req.params.customerId;
    Customer.deleteOne({ _id: id })
        .exec()
        .then(result => {
            console.log("From database:\n" + result);
            res.status(200).json({
                message: 'Successfully deleted customer with ID ' + id
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;