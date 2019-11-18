const express = require('express');
const router = express.Router(); // gives capabilities to conveniently handle different routes
const mongoose = require('mongoose');
const checkAuth = require('../middleware/auth-check');

const Product = require('../models/product'); //Product schema

//get is a method that will handle all incoming get requests
router.get('/', checkAuth, (req, res, next) => {
    Product.find()
        .select('_id name quantity')
        .exec()
        .then(docs => {
            console.log("From database:\n" + docs);
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        quantity: doc.quantity,
                        unit: doc.unit,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
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
router.post('/', checkAuth, (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        quantity: req.body.quantity,
        unit: req.body.unit
    });
    product.save().then(result => {
        console.log("From database:\n" + result);
        res.status(201).json({
            createdProduct: {
                name: result.name,
                quantity: result.quantity,
                unit: result.unit,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
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

/*** requests for individual products ***/
router.get('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId; // extract id from url
    Product.findById(id)
        .exec()
        .then(doc => {
            console.log("From database:\n" + doc);
            if (doc) {
                res.status(200).json({
                    name: doc.name,
                    quantity: doc.quantity,
                    unit: doc.unit,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        description: 'To get all products',
                        url: 'http://localhost:3000/products/'
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

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    // Looping through the request body to check
    // which attributes that are to be patched
    const props = req.body;
    Product.updateOne({_id: id}, props)
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
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

router.delete('/:productId', checkAuth,(req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({_id: id})
        .exec()
        .then(result => {
            console.log("From database:\n" + result);
            res.status(200).json({
                message: 'Successfully deleted product with ID ' + id
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