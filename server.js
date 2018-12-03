'use strict';

require('dotenv').config()

// original packages

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGOLAB_URI, { useMongoClient: true }, function(err, db) {
  if (err) {
    console.log("Could not connect to the database!");
    throw (err);
  }
  else {
    console.log("The database is connected!")
  }
});



app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/shorturl/new", function (req, res) {
  console.log(req);
  res.json({greeting: process.env.TESTTEST, url: 'test'});
});

// listen for requests :)

var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port + ' http://localhost:' + listener.address().port);
});
