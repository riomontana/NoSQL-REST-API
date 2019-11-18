const express = require('express');
const app = express(); //exec express like a function so that we can use express methods
const morgan = require('morgan'); // Funnel all API requests through this logging middleware
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// requests are forwarded to this file if
//the url that they are targeting is /products
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const customerRoutes = require('./api/routes/customers');
const employeeRoutes = require('./api/routes/employees');
const commentRoutes = require('./api/routes/comments');
const storeRoutes = require('./api/routes/stores');
const itemRoutes = require('./api/routes/items');
const userRoutes = require('./api/routes/user');
const reportRoutes = require('./api/routes/reports');

// TODO Put the password in nodemon.json as global variable
mongoose.connect('mongodb+srv://mongodb:malmouniversitet@cluster0-tq7tt.mongodb.net/test', { useNewUrlParser: true })

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Extract json data and make it easy to read

// Add headers to the response (whenever a response is sended)
// to prevent CORS errors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods',
            'GET, PUT, POST, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
});

// Routes which handle requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/customers', customerRoutes);
app.use('/employees', employeeRoutes);
app.use('/comments', commentRoutes);
app.use('/stores', storeRoutes);
app.use('/items', itemRoutes);
app.use('/reports', reportRoutes);
app.use('/user', userRoutes);

// Catching all API requests that does not fit the previous routes
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error); // forward the error request
});

// Handle all request and application errors here
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;
