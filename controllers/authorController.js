'use strict';

const async = require('async');
const Author = require('../models/author');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.authorList = (req, res, next) => {
  Author.find()
    .sort([['lastName', 'ascending']])
    .exec((err, listOfAuthors) => {
      if (err) next(err);
      res.render('author_list', {
        title: 'Author List',
        listOfAuthors
      });
    });
};

exports.authorDetail = (req, res, next) => {
  async.parallel({
    author(callback) {
      Author.findById(req.params.id)
        .exec(callback);
    },
    authorsBooks(callback) {
      Book.find({ author: req.params.id }, 'title summary')
        .exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    if (results.author === null) {
      const err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }

    res.render('author_detail', {
      title: 'Author Detail',
      author: results.author,
      authorsBooks: results.authorsBooks
    });
  });
};

exports.authorCreateGet = (req, res) => {
  res.render('author_form', { title: 'Create Author' });
};

exports.authorCreatePost = [
  body('firstName')
    .isLength({ min: 1 })
    .trim()
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alhanumeric characters'),
  body('lastName')
    .isLength({ min: 1 })
    .trim()
    .withMessage('Last name must be specified')
    .isAlphanumeric()
    .withMessage('Last name has non-alhanumeric characters'),
  body('dateOfBirth', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('dateOfDeath', 'Invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601(),

  sanitizeBody('firstName').trim().escape(),
  sanitizeBody('lastName').trim().escape(),
  sanitizeBody('dateOfBirth').toDate(),
  sanitizeBody('dateOfDeath').toDate(),

  (req, res, next) => {
    const errors = validationResult(req);

    if  (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Create Author',
        author: req.body,
        errors: errors.array()
      });
    } else {
      const author = new Author({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dateOfBirth: req.body.dateOfBirth,
        dateOfDeath: req.body.dateOfDeath
      });

      author.save(err => {
        if (err) return next(err);
        res.redirect(author.url);
      });
    }
  }
];

exports.authorDeleteGet = (req, res, next) => {
  async.parallel({
    author(callback) {
      Author.findById(req.params.id)
        .exec(callback);
    },
    authorBooks(callback) {
      Book.find({ author: req.params.id })
        .exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    if (results.author === null) res.redirect('/catalog/authors');
    res.render('author_delete', {
      title: 'Delete Author',
      author: results.author,
      authorBooks: results.authorBooks,
    });
  });
};

exports.authorDeletePost = (req, res, next) => {
  async.parallel({
    author(callback) {
      Author.findById(req.body.authorid)
        .exec(callback);
    },
    authorBooks(callback) {
      Book.find({ author: req.body.authorid })
        .exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    if (results.authorBooks.length > 0) {
      res.render('author_delete', {
        title: 'Delete Author',
        author: results.author,
        authorBooks: results.authorBooks,
      });
      return;
    } else {
      Author.findByIdAndRemove(req.body.authorid, err => {
        if (err) return next(err);
        res.redirect('/catalog/authors');
      });
    }
  });
};

exports.authorUpdateGet = (req, res, next) => {
  Author.findById(req.params.id)
    .exec((err, author) => {
      if (err) return next(err);
      if (author === null) {
        const error = new Error('Author not found');
        error.status = 404;
        return next(error);
      }
      res.render('author_form', {
        title: 'Update Author',
        author,
      });
    });
};

exports.authorUpdatePost = [

  body('firstName')
    .isLength({ min: 1 })
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('Last name has non-alhanumeric characters')
    .trim(),
  body('lastName')
    .isLength({ min: 1 })
    .withMessage('Last name must be specified')
    .isAlphanumeric()
    .withMessage('Last name has non-alhanumeric characters')
    .trim(),
  body('dateOfBirth', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('dateOfDeath', 'Invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601(),

  sanitizeBody('firstName').trim().escape(),
  sanitizeBody('lastName').trim().escape(),
  sanitizeBody('dateOfBirth').toDate(),
  sanitizeBody('datOfDeath').toDate(),

  (req, res, next) => {
    const errors = validationResult(req);

    if  (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Create Author',
        author: req.body,
        errors: errors.array()
      });
      return;
    } else {
      const author = new Author({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dateOfBirth: req.body.dateOfBirth,
        dateOfDeath: req.body.dateOfDeath,
        _id: req.params.id,
      });
      Author.findByIdAndUpdate(req.params.id, author, {},
        (err, createdAuthor) => {
          if (err) return next(err);
          res.redirect(createdAuthor.url);
        });
    }
  }
];
