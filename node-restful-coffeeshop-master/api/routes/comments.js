const express = require('express');
const router = express.Router(); // gives capabilities to conveniently handle different routes
const mongoose = require('mongoose');
const checkAuth = require('../middleware/auth-check');

const Comment = require('../models/comment'); //Comment schema
const Employee = require('../models/employee') //Employee schema

//get is a method that will handle all incoming get requests
router.get('/', checkAuth, (req, res, next) => {
    Comment.find()
        .select('_id comment entry_date employerId  ')
        .exec()
        .then(docs => {
            console.log("From database:\n" + docs);
            const response = {
                count: docs.length,
                comments: docs.map(doc => {
                    return {
                        comment: doc.comment,
                        entry_date: doc.entry_date,
                        employeeId: doc.employeeId,
                        employerId: doc.employerId,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/comments/' + doc._id
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

    Employee.findById(req.body.employerId)
        .then(result => {
            if (result.current_role != "Boss") {
                res.status(500).json({
                    error: "You do not have permission to perform this action"
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

    const comment = new Comment({
        _id: new mongoose.Types.ObjectId(),
        comment: req.body.comment,
        entry_date: new Date(),
        employeeId: req.body.employeeId,
        employerId: req.body.employerId
    });
    comment.save().then(result => {
        console.log("From database:\n" + result);
        res.status(201).json({
            createdComment: {
                comment: result.comment,
                entry_date: result.entry_date,
                employeeId: result.employeeId,
                employerId: result.employerId,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/comments/' + result._id
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

/*** requests for individual comments ***/
router.get('/:commentId', checkAuth, (req, res, next) => {
    const id = req.params.commentId; // extract id from url
    Comment.findById(id)
        .find('name ssn country member_since occupation loyalty_coffee')
        .exec()
        .then(doc => {
            console.log("From database:\n" + doc);
            if (doc) {
                res.status(200).json({
                    comment: doc.comment,
                    entry_date: doc.entry_date,
                    employeeId: doc.employeeId,
                    employerId: doc.employerId,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        description: 'Get all comments',
                        url: 'http://localhost:3000/comments/'
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

router.patch('/:commentId', checkAuth, (req, res, next) => {
    const id = req.params.commentId;
    // Looping through the request body to check
    // which attributes that are to be patched
    const props = req.body;
    Comment.updateOne({
            _id: id
        }, props)
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Comment updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/comments/' + id
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

router.delete('/:commentId', checkAuth,(req, res, next) => {
    const id = req.params.commentId;
    Comment.deleteOne({
            _id: id
        })
        .exec()
        .then(result => {
            console.log("From database:\n" + result);
            res.status(200).json({
                message: 'Successfully deleted comment with ID ' + id
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