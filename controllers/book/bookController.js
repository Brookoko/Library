'use strict';

const Book = require('../../models/book');
const BookInstance = require('../../models/bookinstance');
const async = require('async');

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

const loadBookData = bookId => ({
  book(callback) {
    Book.findById(bookId)
      .populate('author')
      .populate('genre')
      .exec(callback);
  },
  bookInstances(callback) {
    BookInstance.find({ 'book': bookId })
      .exec(callback);
  },
});

exports.bookDetail = (req, res, next) => {
  async.parallel(
    loadBookData(req.params.id),
    (err, results) => {
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


