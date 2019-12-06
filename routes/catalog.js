'use strict';

const express = require('express');
const router = express.Router();

const routeRegister = require('./routeRegister');

const indexController = require('../controllers/indexController');
const authorController = require('../controllers/author/authorController');
const bookController = require('../controllers/book/bookController');
const bookInstanceController = require('../controllers/bookInstanceController');
const genreController = require('../controllers/genreController');

router.get('/', indexController.index);
router.get('/authors', authorController.authorList);
router.get('/books', bookController.bookList);
router.get('/bookinstances', bookInstanceController.bookInstanceList);
router.get('/genres', genreController.genreList);

routeRegister.registryControllerForRoute('/catalog', router);

