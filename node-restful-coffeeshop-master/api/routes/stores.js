const express = require('express');
const router = express.Router(); // gives capabilities to conveniently handle different routes
const mongoose = require('mongoose');

const Store = require('../models/store');

//Get all stores
router.get('/', (req, res, next) => {
    Store.find()
        .select('_id currency name location employeeSSN menu   ')
        .exec()
        .then(docs => {
            console.log("From database: \n" + docs);
            const response = {
                count: docs.length,
                stores: docs.map(doc => {
                    return {
                        _id: doc._id,
                        currency: doc.currency,
                        name: doc.name,
                        location: doc.location,
                        menu: doc.menu,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/stores/' + doc._id
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

router.post('/', (req, res, next) => {
    console.log("incoming: " + req.body.name);
    const store = new Store({
        _id: new mongoose.Types.ObjectId(),
        currency: req.body.currency,
        name: req.body.name,
        location: req.body.location,
        menu: req.body.menu,
    });
    store.save().then(result => {
        console.log("From database:\n" + result);
        res.status(201).json({
            createdStore: {
                _id: result._id,
                currency: result.currency,
                name: result.name,
                location: result.location,
                menu: result.menu,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/stores/' + result._id
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
})

router.get('/:storeId', (req, res, next) => {
    const id = req.params.storeId; // extract id from url
    Store.findById(id)
        .find('currency name location employeeSSN menu   ')
        .exec()
        .then(doc => {
            console.log("From database:\n" + doc);
            if (doc) {
                res.status(200).json({
                    _id: doc._id,
                    currency: doc.currency,
                    name: doc.name,
                    location: doc.location,
                    menu: doc.menu,
                    request: {
                        type: 'GET',
                        description: 'Get all stores',
                        url: 'http://localhost:3000/stores/'
                    }
                });
            } else {
                res.status(404).json({
                    message: 'No such entry exists for the provided ID'
                });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Invalid ID',
                error: err
            });
        });
});

router.patch('/:storeId', (req, res, next) => {
    const id = req.params.storeId;
    // Looping through the request body to check
    // which attributes that are to be patched
    const props = req.body;
    Store.updateOne({ _id: id }, props)
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Store updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/stores/' + id
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

router.delete('/:storeId', (req, res, next) => {
    const id = req.params.storeId;
    Store.deleteOne({
            _id: id
        })
        .exec()
        .then(result => {
            console.log("From database:\n" + result);
            res.status(200).json({
                message: 'Successfully deleted Store with ID ' + id
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