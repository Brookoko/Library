'use strict';

const Book = require('../../models/book');
const BookInstance = require('../../models/bookinstance');
const async = require('async');

const loadBookData = bookId => ({
  book(callback) {
    Book.findById(bookId, 'title author')
      .populate('author')
      .exec(callback);
  },
  bookInstances(callback) {
    BookInstance.find({ book: bookId })
      .exec(callback);
  },
});

const renderPage = (res, results) => {
  res.render('book_delete', {
    title: 'Delete book',
    book: results.book,
    bookInstances: results.bookInstances,
  });
};

exports.bookDeleteGet = (req, res, next) => {
  async.parallel(
    loadBookData(req.params.id),
    (err, results) => {
      if (err) return next(err);
      if (results.book === null) res.redirect('/catalog/books');
      renderPage(res, results);
    });
};

exports.bookDeletePost = (req, res, next) => {
  async.parallel(
    loadBookData(req.body.bookid),
    (err, results) => {
      if (err) return next(err);
      if (results.bookInstances.length > 0) {
        renderPage(res, results);
        return;
      } else {
        Book.findByIdAndRemove(req.body.bookid, err => {
          if (err) return next(err);
          res.redirect('/catalog/books');
        });
      }
    });
};
