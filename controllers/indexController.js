'use strict';

const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const async = require('async');

const countInstance = () => ({
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
});

exports.index = (req, res) => {
  async.parallel(
    countInstance(),
    (err, results) => {
      res.render('index', {
        title: 'Local Library Home',
        error: err,
        data: results });
    });
};
