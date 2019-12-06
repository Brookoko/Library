'use strict';

const Book = require('../../models/book');
const Author = require('../../models/author');
const Genre = require('../../models/genre');
const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

const loadBookRelatedData = () => ({
  authors(callback) {
    Author.find(callback);
  },
  genres(callback) {
    Genre.find(callback);
  }
});

const createGenreCopy = () => (req, res, next) => {
  if (!(req.body.genre instanceof Array)) {
    if (typeof req.body.genre === 'undefined') req.body.genre = [];
    else req.body.genre = new Array(req.body.genre);
  }
  next();
};

const validateData = () => ([
  body('title', 'Title must not be empty').isLength({ min: 1 }).trim(),
  body('author', 'Author must not be empty').isLength({ min: 1 }).trim(),
  body('summary', 'Summary must not be empty').isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim()
]);

const sanitizeBody = () => ([
  sanitize('*').trim().escape()
]);

const createBook = req => new Book({
  title: req.body.title,
  author: req.body.author,
  summary: req.body.summary,
  isbn: req.body.isbn,
  genre: req.body.genre,
});

const checkBookGenres = (book, genres) => {
  for (let i = 0; i < genres.length; i++) {
    if (book.genre.indexOf(genres[i]._id) > -1) {
      genres[i].checked = 'true';
    }
  }
};

exports.bookCreateGet = (req, res, next) => {
  async.parallel(
    loadBookRelatedData(),
    (err, results) => {
      if (err) return next(err);
      res.render('book_form', {
        title: 'Create book',
        authors: results.authors,
        genres: results.genres,
      });
    });
};

exports.bookCreatePost = [
  createGenreCopy(),

  ...validateData(),
  ...sanitizeBody(),

  (req, res, next) => {

    const errors = validationResult(req);

    const book = createBook(req);

    if (!errors.isEmpty()) {

      async.parallel(
        loadBookRelatedData(),
        (err, results) => {
          if (err) return next(err);

          checkBookGenres(book, results.genres);
          res.render('book_form', {
            title: 'Create book',
            authors: results.authors,
            genres: results.genres,
            book,
            errors: errors.array(),
          });
        });
    } else {
      book.save(err => {
        if (err) return next(err);
        res.redirect(book.url);
      });
    }
  }
];
