const express = require('express');
const router = express.Router(); // gives capabilities to conveniently handle different routes
const mongoose = require('mongoose');

const Item = require('../models/item');

//Get all items
router.get('/', (req, res, next) => {
    Item.find()
        .select('name price category ingredients _id')
        .exec()
        .then(docs => {
            console.log("From database:\n" + docs);
            const response = {
                count: docs.length,
                items: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        category: doc.category,
                        ingredients: doc.ingredients,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/items/' + doc._id
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

//Create an item
router.post('/', (req, res, next) => {
    const item = new Item({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        ingredients: req.body.ingredients
    });
    item.save()
        .then(result => {
            console.log('From database:\n' + result);
            res.status(201).json({
                createdItem: {
                    _id: result._id,
                    name: result.name,
                    price: result.price,
                    category: result.category,
                    ingredients: result.ingredients,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/items/' + result._id
                    }
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

//get a specific item
router.get('/:itemId', (req, res, next) => {
    const id = req.params.itemId; // extract id from url
    Item.findById(id)
        .exec()
        .then(doc => {
            console.log("From database:\n" + doc);
            if (doc) {
                res.status(200).json({
                    _id: doc._id,
                    name: doc.name,
                    price: doc.price,
                    category: doc.category,
                    ingredients: doc.ingredients,
                    request: {
                        type: 'GET',
                        description: 'To get all items',
                        url: 'http://localhost:3000/items/'
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

router.patch('/:itemId', (req, res, next) => {
    const id = req.params.itemId;
    // Looping through the request body to check
    // which attributes that are to be patched
    const props = req.body;
    Item.updateOne({ _id: id }, props)
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Item updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/items/' + id
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

//delete a specific item
router.delete('/:itemId', (req, res, next) => {
    const id = req.params.itemId;
    Item.deleteOne({ _id: id })
        .exec()
        .then(result => {
            console.log("From database:\n" + result);
            res.status(200).json({
                message: 'Successfully deleted item with ID ' + id
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