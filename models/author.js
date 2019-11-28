'use strict';

const moment = require('moment');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  firstName: { type: String, required: true, max: 100 },
  lastName: { type: String, required: true, max: 100 },
  dateOfBirth: { type: Date },
  dateOfDeath: { type: Date },
});

AuthorSchema
  .virtual('name')
  .get(function () {
    return this.lastName + ', ' + this.firstName;
  });

AuthorSchema
  .virtual('lifespan')
  .get(function () {
    return this.dateOfDeath.getYear() - this.dateOfBirth.getYear();
  });

AuthorSchema
  .virtual('lifespanFormatted')
  .get(function () {
    return `${this.dateOfBirth ? this.dateOfDeath ?
      `${moment(this.dateOfBirth).format('MMMM Do, YYYY')} -\
       ${moment(this.dateOfDeath).format('MMMM Do, YYYY')}` :
      `${moment(this.dateOfBirth).format('MMMM Do, YYYY')} -` : '-'}`;
  });

AuthorSchema
  .virtual('dateOfBirthFormatted')
  .get(function () {
    console.log(moment(this.dateOfBirth).format('YYYY-MM-DD'));
    return this.dateOfBirth ?
      moment(this.dateOfBirth).format('YYYY-MM-DD') : '';
  });

AuthorSchema
  .virtual('dateOfDeathFormatted')
  .get(function () {
    console.log(moment(this.dateOfBirth).format('YYYY-MM-DD'));
    return this.dateOfDeath ?
      moment(this.dateOfDeath).format('YYYY-MM-DD') : '';
  });

AuthorSchema
  .virtual('url')
  .get(function () {
    return '/catalog/author/' + this._id;
  });

module.exports = mongoose.model('Author', AuthorSchema);
