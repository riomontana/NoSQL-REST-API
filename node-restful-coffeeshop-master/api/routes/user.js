const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/auth-check');

const User = require('../models/user');

// Create a user with a hashed and salted password
router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(doc => {
            if (doc.length >= 1) {
                return res.status(409).json({
                    message: 'An account for the provided email address already exists'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user
                            .save()
                            .then(result => {
                                console.log('From database, user post: ' + result);
                                res.status(201).json({
                                    message: 'Created new user'
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        })
        .catch();
});

router.post('/login', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Authentication failed'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (error, result) => {
                if (error) {
                    return res.status(401).json({
                        message: 'Authentication failed'
                    });
                }
                if (result) {
                    // Create a token encoded in base64 string
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id
                        }, process.env.JWT_KEY || 'secret',
                        {
                            expiresIn: "7d"
                        });
                    return res.status(200).json({
                        message: 'Authentication successful',
                        token: token
                    });
                }
                res.status(401).json({
                    message: 'Authentication failed'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

//delete a specific user
router.delete('/:userId', checkAuth,(req, res, next) => {
    const id = req.params.userId;
    User.deleteOne({_id: id})
        .exec()
        .then(result => {
            console.log("From database:\n" + result);
            res.status(200).json({
                message: 'Successfully deleted user'
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