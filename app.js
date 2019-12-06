'use strict';

const express = require('express');

require('./routes/index');

const enviroment = require('./enviroment');
const db = require('./db');
const routeRegister = require('./routes/routeRegister');
const errorHandler = require('./utils/errorHandler');

const app = express();

db.connect();
enviroment.applyParameters(app);
routeRegister.setUpRoutes(app);
errorHandler.provideBasicHandling(app);

module.exports = app;
