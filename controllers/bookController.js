'use strict';

const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

exports.index = (req, res) => {
  async.parallel({
    bookCount(callback) {
      Book.countDocuments({}, callback);
    },
    bookInstanceCount(callback) {
      BookInstance.countDocuments({}, callback);
    },
    bookInstanceAvailableCount(callback) {
      BookInstance.countDocuments({ status: 'Available' }, callback);
    },
    authorCount(callback) {
      Author.countDocuments({}, callback);
    },
    genreCount(callback) {
      Genre.countDocuments({}, callback);
    }
  }, (err, results) => {
    res.render('index', {
      title: 'Local Library Home',
      error: err,
      data: results });
  });
};

exports.bookList = (req, res, next) => {
  Book.find({}, 'title author')
    .populate('author')
    .exec((err, listOfBooks) => {
      if (err) return next(err);
      res.render('book_list', {
        title: 'Book List',
        listOfBooks
      });
    });
};

exports.bookDetail = (req, res, next) => {
  async.parallel({
    book(callback) {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    bookInstances(callback) {
      BookInstance.find({ 'book': req.params.id })
        .exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    if (results.book === null) {
      const err = new Error('book not found');
      err.status = 404;
      return next(err);
    }

    res.render('book_detail', {
      title: 'Title',
      book: results.book,
      bookInstances: results.bookInstances,
    });
  });
};

exports.bookCreateGet = (req, res, next) => {
  async.parallel({
    authors(callback) {
      Author.find(callback);
    },
    genres(callback) {
      Genre.find(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    res.render('book_form', {
      title: 'Create book',
      authors: results.authors,
      genres: results.genres,
    });
  });
};

exports.bookCreatePost = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  body('title', 'Title must not be empty').isLength({ min: 1 }).trim(),
  body('author', 'Author must not be empty').isLength({ min: 1 }).trim(),
  body('summary', 'Summary must not be empty').isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

  sanitize('*').trim().escape(),

  (req, res, next) => {

    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {

      async.parallel({
        authors(callback) {
          Author.find(callback);
        },
        genres(callback) {
          Genre.find(callback);
        }
      }, (err, results) => {
        if (err) return next(err);

        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
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

exports.bookDeleteGet = (req, res, next) => {
  async.parallel({
    book(callback) {
      Book.findById(req.params.id, 'title author')
        .populate('author')
        .exec(callback);
    },
    bookInstances(callback) {
      BookInstance.find({ book: req.params.id })
        .exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    if (results.book === null) res.redirect('/catalog/books');
    res.render('book_delete', {
      title: 'Delete book',
      book: results.book,
      bookInstances: results.bookInstances,
    });
  });
};

exports.bookDeletePost = (req, res, next) => {
  async.parallel({
    book(callback) {
      Book.findById(req.body.bookid, 'title author')
        .populate('author')
        .exec(callback);
    },
    bookInstances(callback) {
      BookInstance.find({ book: req.body.bookid })
        .exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    if (results.bookInstances.length > 0) {
      res.render('book_delete', {
        title: 'Delete book',
        book: results.book,
        bookInstances: results.bookInstances,
      });
      return;
    } else {
      Book.findByIdAndRemove(req.body.bookid, err => {
        if (err) return next(err);
        res.redirect('/catalog/books');
      });
    }
  });
};

exports.bookUpdateGet = (req, res, next) => {
  async.parallel({
    book(callback) {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    authors(callback) {
      Author.find(callback);
    },
    genres(callback) {
      Genre.find(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    if (results.book === null) {
      const error = new Error('book not found');
      error.status = 404;
      return next(error);
    }
    for (const genre of results.genres) {
      for (const bookGenre of results.book.genre) {
        if (genre._id.toString() === bookGenre._id.toString()) {
          genre.checked = 'true';
        }
      }
    }
    res.render('book_form', {
      title: 'Update book',
      authors: results.authors,
      genres: results.genres,
      book: results.book,
    });
  });
};

exports.bookUpdatePost = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  body('title', 'Title must be empty').isLength({ min: 1 }).trim(),
  body('author', 'Author must be empty').isLength({ min: 1 }).trim(),
  body('summary', 'Summary must be empty').isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must be empty').isLength({ min: 1 }).trim(),

  sanitize('title').trim().escape(),
  sanitize('author').trim().escape(),
  sanitize('summary').trim().escape(),
  sanitize('isbn').trim().escape(),
  sanitize('genre.*').trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: (typeof req.body.genre === 'undefined' ? [] : req.body.genre),
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      async.parallel({
        authors(callback) {
          Author.find(callback);
        },
        genres(callback) {
          Genre.find(callback);
        },
      }, (err, results) => {
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
      book.findByIdAndUpdate(req.params.id, book, {}, (err, createdbook) => {
        if (err) return next(err);
        res.redirect(createdbook.url);
      });
    }
  }
];
