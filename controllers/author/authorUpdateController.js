'use strict';

const Author = require('../../models/author');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const validateData = () => ([
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
]);

const sanitize = () => ([
  sanitizeBody('firstName').trim().escape(),
  sanitizeBody('lastName').trim().escape(),
  sanitizeBody('dateOfBirth').toDate(),
  sanitizeBody('datOfDeath').toDate()
]);

const processErrors = (req, res, errors) => {
  res.render('author_form', {
    title: 'Create Author',
    author: req.body,
    errors: errors.array()
  });
};

const createAuthor = req => new Author({
  firstName: req.body.firstName,
  lastName: req.body.lastName,
  dateOfBirth: req.body.dateOfBirth,
  dateOfDeath: req.body.dateOfDeath,
  _id: req.params.id,
});

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
  ...validateData(),
  ...sanitize(),

  (req, res, next) => {
    const errors = validationResult(req);

    if  (!errors.isEmpty()) {
      processErrors(req, res, errors);
      return;
    } else {
      const author = createAuthor(req);
      Author.findByIdAndUpdate(req.params.id, author, {},
        (err, createdAuthor) => {
          if (err) return next(err);
          res.redirect(createdAuthor.url);
        });
    }
  }
];
