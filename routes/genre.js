'use strict';

const express = require('express');
const router = express.Router();

const routeRegister = require('./routeRegister');
const genreController = require('../controllers/genreController');

router.get('/create', genreController.genreCreateGet);
router.post('/create', genreController.genreCreatePost);
router.get('/:id/delete', genreController.genreDeleteGet);
router.post('/:id/delete', genreController.genreDeletePost);
router.get('/:id/update', genreController.genreUpdateGet);
router.post('/:id/update', genreController.genreUpdatePost);
router.get('/:id', genreController.genreDetail);
router.get('/genres', genreController.genreList);

routeRegister.registryControllerForRoute('/catalog/genre', router);

