'use strict';

const moment = require('moment');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  imprint: { type: String, required: true },
  status: { type: String, required: true, enum: [
    'Available', 'Maintenance', 'Loaned', 'Reserved'
  ], default: 'Maintenance' },
  dueBack: { type: Date, default: Date.now },
});

BookInstanceSchema
  .virtual('url')
  .get(function () {
    return '/catalog/bookinstance/' + this._id;
  });

BookInstanceSchema
  .virtual('dueBackFormatted')
  .get(function () {
    return moment(this.dueBack).format('MMMM Do, YYYY');
  });

BookInstanceSchema
  .virtual('dueBackFormattedForInput')
  .get(function () {
    return this.dueBack ? moment(this.dueBack).format('YYYY-MM-DD') : '';
  });

module.exports = mongoose.model('BookInstance', BookInstanceSchema);
