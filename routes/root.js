'use strict';

const express = require('express');
const router = express.Router();
const routeRegister = require('./routeRegister');

router.get('/', (req, res) => {
  res.redirect('/catalog');
});

routeRegister.registryControllerForRoute('/', router);
