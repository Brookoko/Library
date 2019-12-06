'use strict';

const mongoose = require('mongoose');
const lifespanDateFormater = require('../utils/lifespanDateFormater');

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
    return this.firstName + ' ' + this.lastName;
  });

AuthorSchema
  .virtual('lifespan')
  .get(function () {
    return this.dateOfDeath.getYear() - this.dateOfBirth.getYear();
  });

AuthorSchema
  .virtual('lifespanFormatted')
  .get(function () {
    return lifespanDateFormater.lifeSpanToString(this.dateOfBirth, this.dateOfDeath);
  });

AuthorSchema
  .virtual('dateOfBirthFormatted')
  .get(function () {
    return lifespanDateFormater.dateToString(this.dateOfBirth);
  });

AuthorSchema
  .virtual('dateOfDeathFormatted')
  .get(function () {
    return lifespanDateFormater.dateToString(this.dateOfDeath);
  });

AuthorSchema
  .virtual('url')
  .get(function () {
    return '/catalog/author/' + this._id;
  });

module.exports = mongoose.model('Author', AuthorSchema);
