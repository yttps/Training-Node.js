var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
require('./db.js');

var adminRouter = require('./routes/admin.js');
var cartRouter = require('./routes/cart.js');
var indexRouter = require('./routes/index');
var loginAndRegisterRouter = require('./routes/loginAndRegister');
var productsRouter = require('./routes/products.js');
var shopRouter = require('./routes/shop.js');
var usersRouter = require('./routes/users');

var cors = require('cors');

var app = express();
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', loginAndRegisterRouter);
app.use('/shop', shopRouter);
app.use('/admin', adminRouter);
app.use('/cart', cartRouter);
app.use('/products', productsRouter);


// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render('error');
});



module.exports = app;
