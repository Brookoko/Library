'use strict';

const express = require('express');
const router = express.Router();

const routeRegister = require('./routeRegister');
const bookController = require('../controllers/book/bookController');
const createController = require('../controllers/book/bookCreateController');
const deleteaController = require('../controllers/book/bookDeleteController');
const updateController = require('../controllers/book/bookUpdateController');

router.get('/create', createController.bookCreateGet);
router.post('/create', createController.bookCreatePost);

router.get('/:id/delete', deleteaController.bookDeleteGet);
router.post('/:id/delete', deleteaController.bookDeletePost);

router.get('/:id/update', updateController.bookUpdateGet);
router.post('/:id/update', updateController.bookUpdatePost);

router.get('/:id', bookController.bookDetail);

routeRegister.registryControllerForRoute('/catalog/book', router);

