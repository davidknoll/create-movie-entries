#!/usr/bin/env node
/**
 * Quiz: Challenge Problem: Create Movie Entries
 *
 * My entry for the challenge problem for week 1 of the MongoDB University M101JS course.
 *
 * @author  David Knoll <david@futurefirst.org.uk>
 * @license MIT
 * @file
 */

// Imports
var express     = require('express'),
    app         = express(),
    engines     = require('consolidate'),
    bodyParser  = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    assert      = require('assert');

// Initialise Express
app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));

// Handler for internal server errors
function errorHandler(err, req, res, next) {
  console.error(err.message);
  console.error(err.stack);
  res.status(500).render('error_template', { error: err });
}

// Connect to MongoDB
MongoClient.connect('mongodb://localhost:27017/video', function (err, db) {
  assert.equal(null, err);
  console.log("Successfully connected to MongoDB.");

  // GET / shows the movie list with the form
  app.get('/', function (req, res) {
    // Look up all movies
    db.collection('movies').find({}).sort({ title: 1, year: 1 }).toArray(function (err, docs) {
      assert.equal(null, err);
      res.render('movies', { 'movies': docs });
    });
  });

  // POST / shows the movie list with the form, but inserts the new movie
  app.post('/', function (req, res, next) {
    var newmovie = {
      title: req.body.title,
      year:  req.body.year,
      imdb:  req.body.imdb
    };

    // Do we have a new movie title?
    // If not, include an error message that will be rendered in the template
    if (!newmovie.title) {
      //next(Error("Please enter at least a movie title!"));
      db.collection('movies').find({}).sort({ title: 1, year: 1 }).toArray(function (err, docs) {
        assert.equal(null, err);
        res.render('movies', { 'movies': docs, error: "Please enter at least a movie title!" });
      });
    }

    // Otherwise, insert the new movie, then display the list again
    else {
      db.collection('movies').insertOne(newmovie, function (err, result) {
        assert.equal(null, err);
        console.log("New movie inserted: " + newmovie.title);
        db.collection('movies').find({}).sort({ title: 1, year: 1 }).toArray(function (err, docs) {
          assert.equal(null, err);
          res.render('movies', { 'movies': docs });
        });
      });
    }
  });

  app.use(errorHandler);

  // Start the Express server
  var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Express server listening on port %s.', port);
  });
});
