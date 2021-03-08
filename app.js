var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var multer  = require('multer');
var logger = require('morgan');

var index = require('./routes/index');

// view engine setup
app.set('views', __dirname+'/views');
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);

module.exports = app;
