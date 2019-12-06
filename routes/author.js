'use strict';

const express = require('express');
const router = express.Router();

const routeRegister = require('./routeRegister');
const authorController = require('../controllers/author/authorController');
const createController = require('../controllers/author/authorCreateController');
const deleteController = require('../controllers/author/authorDeleteController');
const updateController = require('../controllers/author/authorUpdateController');

router.get('/create', createController.authorCreateGet);
router.post('/create', createController.authorCreatePost);

router.get('/:id/delete', deleteController.authorDeleteGet);
router.post('/:id/delete', deleteController.authorDeletePost);

router.get('/:id/update', updateController.authorUpdateGet);
router.post('/:id/update', updateController.authorUpdatePost);

router.get('/:id', authorController.authorDetail);

routeRegister.registryControllerForRoute('/catalog/author', router);

