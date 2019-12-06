'use strict';

const Author = require('../../models/author');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const validateData = () => ([
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
    .isISO8601()
]);

const sanitaize = () => ([
  sanitizeBody('firstName').trim().escape(),
  sanitizeBody('lastName').trim().escape(),
  sanitizeBody('dateOfBirth').toDate(),
  sanitizeBody('dateOfDeath').toDate()
]);

const processError = (req, res, errors) => {
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
  dateOfDeath: req.body.dateOfDeath
});


exports.authorCreateGet = (req, res) => {
  res.render('author_form', { title: 'Create Author' });
};

exports.authorCreatePost = [
  ...validateData(),
  ...sanitaize(),

  (req, res, next) => {
    const errors = validationResult(req);

    if  (!errors.isEmpty()) {
      processError(req, res, errors);
    } else {
      const author = createAuthor();

      author.save(err => {
        if (err) return next(err);
        res.redirect(author.url);
      });
    }
  }
];
