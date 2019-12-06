'use strict';

const moment = require('moment');

module.exports.dateToString = date => (date ? moment(date).format('YYYY-MM-DD') : '');

const dateToLifespanFormat = date => (date ? moment(date).format('Do MMMM YYYY') : '');

module.exports.lifeSpanToString = (birthDate, deathDate) =>
  dateToLifespanFormat(birthDate) + ' - ' + dateToLifespanFormat(deathDate);

