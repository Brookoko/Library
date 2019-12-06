'use strict';

const Book = require('../../models/book');
const Author = require('../../models/author');
const Genre = require('../../models/genre');
const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

const loadBook = bookId => ({
  book(callback) {
    Book.findById(bookId)
      .populate('author')
      .populate('genre')
      .exec(callback);
  },
});

const loadBookData = () => ({
  authors(callback) {
    Author.find(callback);
  },
  genres(callback) {
    Genre.find(callback);
  },
});

const checkBookGenres = (book, genres) => {
  for (const genre of genres) {
    for (const bookGenre of book.genre) {
      if (genre._id.toString() === bookGenre._id.toString()) {
        genre.checked = 'true';
      }
    }
  }
};

const creatGenreCopy = () => (req, res, next) => {
  if (!(req.body.genre instanceof Array)) {
    if (typeof req.body.genre === 'undefined') req.body.genre = [];
    else req.body.genre = new Array(req.body.genre);
  }
  next();
};

const validateData = () => ([
  body('title', 'Title must be empty').isLength({ min: 1 }).trim(),
  body('author', 'Author must be empty').isLength({ min: 1 }).trim(),
  body('summary', 'Summary must be empty').isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must be empty').isLength({ min: 1 }).trim(),
]);

const sanitizeBody = () => ([
  sanitize('title').trim().escape(),
  sanitize('author').trim().escape(),
  sanitize('summary').trim().escape(),
  sanitize('isbn').trim().escape(),
  sanitize('genre.*').trim().escape(),
]);

const createBook = req => new Book({
  title: req.body.title,
  author: req.body.author,
  summary: req.body.summary,
  isbn: req.body.isbn,
  genre: (typeof req.body.genre === 'undefined' ? [] : req.body.genre),
  _id: req.params.id
});

exports.bookUpdateGet = (req, res, next) => {
  async.parallel(
    { ...loadBook(req.params.id), ...loadBookData() },
    (err, results) => {
      if (err) return next(err);
      if (results.book === null) {
        const error = new Error('book not found');
        error.status = 404;
        return next(error);
      }
      checkBookGenres(results.book, results.genres);
      res.render('book_form', {
        title: 'Update book',
        authors: results.authors,
        genres: results.genres,
        book: results.book,
      });
    });
};

exports.bookUpdatePost = [
  creatGenreCopy(),

  ...validateData(),
  ...sanitizeBody(),

  (req, res, next) => {
    const errors = validationResult(req);

    const book = createBook(req);

    if (!errors.isEmpty()) {
      async.parallel(
        loadBookData(),
        (err, results) => {
          if (err) return next(err);
          for (const genre in results.genres) {
            if (book.genre.indexOf(genre) > -1) {
              genre.checked = 'true';
            }
          }
          res.render('book_form', {
            title: 'Update book',
            authors: results.authors,
            genres: results.genres,
            book,
            errors: errors.array()
          });
          return;
        });
    } else {
      Book.findByIdAndUpdate(req.params.id, book, {}, (err, createdbook) => {
        if (err) return next(err);
        res.redirect(createdbook.url);
      });
    }
  }
];
