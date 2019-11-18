const express = require('express');
const router = express.Router(); // gives capabilities to conveniently handle different routes
const mongoose = require('mongoose');
const checkAuth = require('../middleware/auth-check');

const Employee = require('../models/employee'); //Employee schema

//get is a method that will handle all incoming get requests
router.get('/', checkAuth, (req, res, next) => {
    Employee.find()
        .select('_id name ssn address current_role startDate work_percent storeId work_history')
        .exec()
        .then(docs => {
            console.log("From database:\n" + docs);
            const response = {
                count: docs.length,
                employees: docs.map(doc => {
                    return {
                        name: doc.name,
                        ssn: doc.ssn,
                        address: doc.address,
                        current_role: doc.current_role,
                        startDate: doc.startDate,
                        work_percent: doc.work_percent,
                        storeId: doc.storeId,
                        work_history: doc.work_history,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/employees/' + doc._id
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
    const employee = new Employee({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        ssn: req.body.ssn,
        address: req.body.address,
        current_role: req.body.current_role,
        startDate: new Date(),
        work_percent: req.body.work_percent,
        storeId: req.body.storeId,
        work_history: req.body.work_history,
    });
    employee.save().then(result => {
        console.log("From database:\n" + result);
        res.status(201).json({
            createdEmployee: {
                name: result.name,
                ssn: result.ssn,
                address: result.address,
                current_role: result.current_role,
                startDate: result.startDate,
                work_percent: result.work_percent,
                storeId: result.storeId,
                work_history: result.work_history,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/employees/' + result._id
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

/*** requests for individual employees ***/
router.get('/:employeeId', checkAuth,(req, res, next) => {
    const id = req.params.employeeId; // extract id from url
    Employee.findById(id)
        .find('name ssn address current_role startDate work_percent storeId work_history')
        .exec()
        .then(doc => {
            console.log("From database:\n" + doc);
            if (doc) {
                res.status(200).json({
                    name: doc.name,
                    ssn: doc.ssn,
                    address: doc.address,
                    current_role: doc.current_role,
                    startDate: doc.startDate,
                    work_percent: doc.work_percent,
                    storeId: doc.storeId,
                    work_history: doc.work_history,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        description: 'Get all employees',
                        url: 'http://localhost:3000/employees/'
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

router.patch('/:employeeId', checkAuth,(req, res, next) => {
    const id = req.params.employeeId;
    // Looping through the request body to check
    // which attributes that are to be patched
    const props = req.body;
    Employee.updateOne({
            _id: id
        }, props)
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Employee updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/employees/' + id
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

router.delete('/:employeeId', checkAuth, (req, res, next) => {
    const id = req.params.employeeId;
    Employee.deleteOne({
            _id: id
        })
        .exec()
        .then(result => {
            console.log("From database:\n" + result);
            res.status(200).json({
                message: 'Successfully deleted employee with ID ' + id
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