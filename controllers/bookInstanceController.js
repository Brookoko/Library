'use strict';

const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.bookInstanceList = (req, res, next) => {
  BookInstance.find()
    .populate('book')
    .exec((err, listOfBookInstances) => {
      if (err) next(err);
      res.render('bookinstance_list', {
        title: 'Book Instance List',
        listOfBookInstances
      });
    });
};

exports.bookInstanceDetail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookInstance) => {
      if (err) return next(err);
      if (bookInstance === null) {
        const err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }

      res.render('bookinstance_detail', {
        title: 'Book:',
        bookInstance,
      });
    });
};

exports.bookInstanceCreateGet = (req, res, next) => {
  Book.find({}, 'title')
    .exec((err, books) => {
      if (err) return next(err);
      res.render('bookinstance_form', {
        title: 'Create BookInstance',
        books
      });
    });
};

exports.bookInstanceCreatePost = [

  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('dueBack', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('dueBack').toDate(),

  (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      dueBack: req.body.dueBack,
    });

    if (!errors.isEmpty()) {
      Book.find({}, 'title')
        .exec((err, books) => {
          if (err)  return next(err);
          res.render('bookinstance_form', {
            title: 'Create BookInstance',
            books,
            selectedBook: bookInstance.book._id,
            errors: errors.array(),
            bookInstance,
          });
        });
      return;
    } else {
      bookInstance.save(err => {
        if (err) return next(err);
        res.redirect(bookInstance.url);
      });
    }
  }
];

exports.bookInstanceDeleteGet = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookInstance) => {
      if (err) return next(err);
      if (bookInstance === null) res.redirect('/catalog/bookinstances');
      res.render('bookinstances_delete', {
        title: 'Delete Copy',
        bookInstance,
      });
    });
};

exports.bookInstanceDeletePost = (req, res, next) => {
  BookInstance.findById(req.body.copyid)
    .populate('book')
    .exec(err => {
      if (err) return next(err);
      BookInstance.findByIdAndRemove(req.body.copyid, err => {
        if (err) return next(err);
        res.redirect('/catalog/bookinstances');
      });
    });
};

exports.bookInstanceUpdateGet = (req, res, next) => {
  async.parallel({
    books(callback) {
      Book.find({}, 'title')
        .exec(callback);
    },
    bookInstance(callback) {
      BookInstance.findById(req.params.id)
        .exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    if (results.bookInstance === null) {
      const error = new Error('Copy not found');
      error.status = 404;
      return next(error);
    }
    res.render('bookinstance_form', {
      title: 'Update BookInstance',
      books: results.books,
      selectedBook: results.bookInstance.book._id,
      bookInstance: results.bookInstance,
    });
  });
};

exports.bookInstanceUpdatePost = [

  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('dueBack', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('dueBack').toDate(),

  (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      dueBack: req.body.dueBack,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Book.find({}, 'title').exec((err, books) => {
        res.render('bookinstance_form', {
          title: 'Update BookInstance',
          books,
          selectedBook: bookInstance.book._id,
          bookInstance,
          errors: errors.array(),
        });
      });
      return;
    } else {
      BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {},
        (err, createdBookInstance) => {
          if (err) return next(err);
          res.redirect(createdBookInstance.url);
        });
    }
  }
];
