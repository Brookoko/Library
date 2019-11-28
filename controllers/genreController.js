'use strict';

const async = require('async');
const Book = require('../models/book');
const Genre = require('../models/genre');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.genreList = (req, res, next) => {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec((err, listOfGenres) => {
      if (err) next(err);
      res.render('genre_list', {
        title: 'Genre List',
        listOfGenres
      });
    });
};

exports.genreDetail = (req, res, next) => {
  async.parallel({
    genre(callback) {
      Genre.findById(req.params.id)
        .exec(callback);
    },
    genreBooks(callback) {
      Book.find({ genre: req.params.id })
        .exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    if (results.genre === null) {
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    res.render('genre_detail', {
      title: 'Genre Detail',
      genre: results.genre,
      genreBooks: results.genreBooks,
    });
  });
};

exports.genreCreateGet = (req, res) => {
  res.render('genre_form', { title: 'Create Genre' });
};

exports.genreCreatePost = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Name must be specified')
    .isAlphanumeric()
    .withMessage('Last name has non-alhanumeric characters')
    .trim(),
  sanitizeBody('name').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      name: req.body.name
    });

    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Create Genre',
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      Genre.findOne({ name: req.body.name })
        .exec((err, foundGenre) => {
          if (err)  return next(err);
          if (foundGenre) res.redirect(foundGenre.url);
          else {
            genre.save(err => {
              if (err) return next(err);
              res.redirect(genre.url);
            });
          }
        });
    }
  }
];

exports.genreDeleteGet = (req, res, next) => {
  async.parallel({
    genre(callback) {
      Genre.findById(req.params.id)
        .exec(callback);
    },
    books(callback) {
      Book.find({ genre: req.params.id }, 'title author summary')
        .populate('author')
        .exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    if (results.genre === null) res.redirect('/catalog/genres');
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre: results.genre,
      books: results.books,
    });
  });
};

exports.genreDeletePost = (req, res, next) => {
  async.parallel({
    genre(callback) {
      Genre.findById(req.body.genreid)
        .exec(callback);
    },
    books(callback) {
      Book.find({ genre: req.body.genreid }, 'title author summary')
        .populate('author')
        .exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    if (results.books.length > 0) {
      res.render('genre_delete', {
        title: 'Delete Genre',
        genre: results.genre,
        books: results.books,
      });
      return;
    } else {
      Genre.findByIdAndRemove(req.body.genreid, err => {
        if (err) return next(err);
        res.redirect('/catalog/genres');
      });
    }
  });
};

exports.genreUpdateGet = (req, res, next) => {
  Genre.findById(req.params.id)
    .exec((err, genre) => {
      if (err) return next(err);
      if (genre === null) {
        const error = new Error('Genre not found');
        error.status = 404;
        return next(error);
      }
      res.render('genre_form', {
        title: 'Update Genre',
        genre,
      });
    });
};

exports.genreUpdatePost = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Name must be specified')
    .isAlphanumeric()
    .withMessage('Name has non-alhanumeric characters')
    .trim(),

  sanitizeBody('name').trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Update Genre',
        genre: req.body.genre,
        errors: errors.array(),
      });
      return;
    } else {
      const genre = new Genre({
        name: req.body.name,
        _id: req.params.id
      });
      Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, createdGenre) => {
        if (err) return next(err);
        res.redirect(createdGenre.url);
      });
    }
  }
];
