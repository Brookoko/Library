'use strict';

const async = require('async');
const Author = require('../../models/author');
const Book = require('../../models/book');

const loadAuthorBookData = authorId => ({
  author(callback) {
    Author.findById(authorId)
      .exec(callback);
  },
  authorBooks(callback) {
    Book.find({ author: authorId })
      .exec(callback);
  }
});

const renderPage = (res, results) => {
  res.render('author_delete', {
    title: 'Delete Author',
    author: results.author,
    authorBooks: results.authorBooks,
  });
};

exports.authorDeleteGet = (req, res, next) => {
  async.parallel(
    loadAuthorBookData(req.params.id),

    (err, results) => {
      if (err) return next(err);
      if (results.author === null) res.redirect('/catalog/authors');
      renderPage(res, results);
    });
};

exports.authorDeletePost = (req, res, next) => {
  async.parallel(
    loadAuthorBookData(req.body.authorid),
    (err, results) => {
      if (err) return next(err);
      if (results.authorBooks.length > 0) {
        renderPage(res, results);
        return;
      } else {
        Author.findByIdAndRemove(req.body.authorid, err => {
          if (err) return next(err);
          res.redirect('/catalog/authors');
        });
      }
    });
};
