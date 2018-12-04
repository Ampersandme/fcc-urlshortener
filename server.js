"use strict";

// original packages

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");

var cors = require("cors");

// my packages
var bodyParser = require("body-parser");
var dotenv = require("dotenv").config();
var dns = require("dns");
var urlExists = require("url-exists");
var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

// mongoose.connect(process.env.MONGOLAB_URI);

// Don't get this entirely???
mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose.connect(
  process.env.MONGOLAB_URI,
  { useMongoClient: true },
  function(err, db) {
    if (err) {
      console.log("Could not connect to the database!");
      throw err;
    } else {
      console.log("The database is connected!");
    }
  }
);

// Creating a model

const Schema = mongoose.Schema;
const schemaURL = new Schema({
  url: {
    type: String,
    required: true
  },
  short_url: {
    type: String
  },
  full_paste: {
    type: String
  }
});

const ModelURL = mongoose.model("main", schemaURL);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({ extended: false }));

// views on landing
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

// test API endpoint...
app.get("/test", (req, res) => {
  console.log(req);
  res.json({ greeting: process.env.TESTTEST, url: "test" });
});

//Shortening URL's or taking the raw URL

app.post("/api/shorturl/new", async (req, res, next) => {
  let rawURL = req.body.url;
  console.log(rawURL);

  // Regex taken from
  // https://github.com/Armandilho/URL-Shortener-Microservice/blob/master/server.js

  var testPattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator)

  if (testPattern.test(rawURL) === true) {
    urlExists(rawURL, async function(err, works) {
      if (works === true) {
        const dbQuery = await ModelURL.find({ full_paste: rawURL });
        if (dbQuery.length !== 0) {
          const { url, short_url, full_paste } = dbQuery[0];
          res.json({ url, short_url, full_paste });
          console.log("Found it, it's already here!");
        } else {
          console.log("Didn't find it, We better add it now!");

          // getting the base name of the website
          const realName = rawURL.match(/(?<=\.)([a-z0-9])*/);

          const getAll = await ModelURL.find();
          const createURL = await ModelURL.create({
            url: realName[0],
            short_url: getAll.length + 1,
            full_paste: rawURL
          });
          const { url, short_url, full_paste } = createdUrl;
          res.json({ url, short_url, full_paste });
        }
      } else {
        console.log("URL does not exist!");
        res.json({ error: "URL does not exist" });
      }
    });
  } else {
    console.log("regex error!");
    res.json({ error: "internal error" });
  }
});

// Dedirecting to true URL from shortURL

app.get("/api/shorturl/:shortNum", async (req, res) => {
  const { shortNum } = req.params;
  console.log(shortNum);
  const dbQuery = await ModelURL.find({ short_url: shortNum });
  console.log(dbQuery);
  console.log(typeof dbQuery.length);
  if (dbQuery.length === 1) {
    console.log("redirecting");
    const redirectURL = dbQuery[0].full_paste;
    console.log(redirectURL);
    res.redirect(redirectURL);
  } else {
    console.log("Not in database");
    res.json({ error: "This short URL has no true URL" });
  }
});

// listen for requests :)

var listener = app.listen(port, function() {
  console.log(
    "Your app is listening on port " +
      listener.address().port +
      " http://localhost:" +
      listener.address().port
  );
});
