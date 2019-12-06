'use strict';

const express = require('express');
const router = express.Router();

const routeRegister = require('./routeRegister');
const bookInstanceController = require('../controllers/bookInstanceController');

router.get('/create', bookInstanceController.bookInstanceCreateGet);
router.post('/create', bookInstanceController.bookInstanceCreatePost);
router.get('/:id/delete', bookInstanceController.bookInstanceDeleteGet);
router.post('/:id/delete', bookInstanceController.bookInstanceDeletePost);
router.get('/:id/update', bookInstanceController.bookInstanceUpdateGet);
router.post('/:id/update', bookInstanceController.bookInstanceUpdatePost);
router.get('/:id', bookInstanceController.bookInstanceDetail);

routeRegister.registryControllerForRoute('/catalog/bookinstance', router);

