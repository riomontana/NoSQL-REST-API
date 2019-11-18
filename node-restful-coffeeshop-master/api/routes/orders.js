const express = require('express');
const router = express.Router(); // gives capabilities to conveniently handle different routes
const mongoose = require('mongoose');
const checkAuth = require('../middleware/auth-check');

const Order = require('../models/order');
const Item = require('../models/item');
const Customer = require('../models/customer');

//Get all orders
router.get('/', (req, res, next) => {
    Order.find()
        .select('date cashier customer items _id')
        .populate('items.item')
        .exec()
        .then(docs => {
            console.log("From database:\n" + docs);
            const response = {
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        date: doc.date,
                        cashier: doc.cashier,
                        customer: doc.customer,
                        items: doc.items,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
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

//Create an order
router.post('/', (req, res, next) => {

    const order = new Order({
        _id: mongoose.Types.ObjectId(),
        date: new Date(),
        cashier: req.body.cashier,
        customer: req.body.customer,
        items: req.body.items,
    });
    order.save()
        .then(result => {

            console.log('From database:\n' + result);
            const itemsArray = req.body.items;
            let customerQty = 0;
            let orderQty = 0;
            let category = "";
            let freeCoffee = 0;

            console.log("category: " + itemsArray[0].category);

            Customer.findById(req.body.customer)
                .then(results => {
                    customerQty += results.loyalty_coffee;
                    console.log("Loyalty coffee: " + customerQty);

                    for (i = 0; i < itemsArray.length; i++) {
                        category = itemsArray[i].category;
                        if (!category.localeCompare("beverage")) {
                            orderQty += itemsArray[i].quantity;
                        }
                        console.log(" orderQty: " + orderQty + "\n customerQty: " + customerQty);
                    }
                    freeCoffee = Math.trunc((customerQty + orderQty) / 10);
                    const newLoyaltyCoffee = (customerQty + orderQty) % 10;
                    Customer.findById(req.body.customer)
                        .update({}, { $set: { loyalty_coffee: newLoyaltyCoffee } })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({ error: err });
                        });
                    res.status(201).json({
                        createdOrder: {
                            freeCoffee: freeCoffee,
                            date: result.date,
                            cashier: result.cashier,
                            customer: result.customer,
                            items: result.items,
                            _id: result._id,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/orders/' + result._id
                            }

                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                });



        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

//get a specific order
router.get('/:orderId',(req, res, next) => {
    const id = req.params.orderId; // extract id from url
    Order.findById(id)
        .exec()
        .then(doc => {
            console.log("From database:\n" + doc);
            if (doc) {
                res.status(200).json({
                    date: doc.date,
                    cashier: doc.cashier,
                    customer: doc.customer,
                    items: doc.items,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        description: 'To get all orders',
                        url: 'http://localhost:3000/orders/'
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

router.patch('/:orderId', checkAuth,(req, res, next) => {
    const id = req.params.orderId;
    // Looping through the request body to check
    // which attributes that are to be patched
    const props = req.body;
    Order.updateOne({ _id: id }, props)
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Order updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + id
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

//delete a specific order
router.delete('/:orderId', checkAuth,(req, res, next) => {
    const id = req.params.orderId;
    Order.deleteOne({ _id: id })
        .exec()
        .then(result => {
            console.log("From database:\n" + result);
            res.status(200).json({
                message: 'Successfully deleted order with ID ' + id
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