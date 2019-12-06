'use strict';

const async = require('async');
const Author = require('../../models/author');
const Book = require('../../models/book');

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

const loadAuthorData = authorId => ({
  author(callback) {
    Author.findById(authorId)
      .exec(callback);
  },
  authorsBooks(callback) {
    Book.find({ author: authorId }, 'title summary')
      .exec(callback);
  }
});

exports.authorDetail = (req, res, next) => {
  async.parallel(
    loadAuthorData(req.params.id),
    (err, results) => {
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

