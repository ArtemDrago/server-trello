const Router = require('express');
const router = new Router();
const appRouter = require('./appRouter.js');

router.use('/', appRouter);

module.exports = router;