'use strict';

const mongoose = require('mongoose');

module.exports.connect = () => {
  const url = 'mongodb+srv://Brookoko:flzG9zRtHSFkLqCt@training-umqdn.mongodb.net/test?retryWrites=true';
  mongoose.connect(url, { useNewUrlParser: true });
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
};

