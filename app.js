var express = require('express');
var createError = require('http-errors');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');


var index = require('./routes/index');
var usersRouter = require('./routes/users');
var restaurant = require('./routes/api/v1.0/restaurant');
var order = require('./routes/api/v1.0/orders');
var detail= require('./routes/api/v1.0/details');
var client= require('./routes/api/v1.0/client');
var menus= require('./routes/api/v1.0/menus');
/*var restaurant = require('./routes/api/v1.0/restaurant');

var detail= require('./routes/api/v1.0/details');

var order = require('./routes/api/v1.0/orders');*/

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api/v1.0/', restaurant);
app.use('/api/clients', clients);
app.use('/api/menus', menus);
app.use('/api/v1.0/', order);
app.use('/api/v1.0/', detail)

/*app.use('/api/v1.0/restaurant', restaurant);
app.use('/api/v1.0/details', detail);
app.use('/api/v1.0/orders', order);*/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
var port = 7777;
app.listen(port, () => {
  console.log("server running in: " + port);
});
