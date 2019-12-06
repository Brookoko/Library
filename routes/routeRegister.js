'use strict';

const router = { };

module.exports.registryControllerForRoute = (route = '', controller) => {
  router[route] = controller;
};

module.exports.setUpRoutes = app => {
  for (const route in router) {
    const controller = router[route];
    app.use(route, controller);
  }
};

