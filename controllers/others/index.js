const express = require('express');
const controller = require('./othersController');
const middlewares = require('../../middlewares');

const router = express.Router();

router.use('/', middlewares.verifyPermission);

router.post('/actions', controller.actions);
// 武漢已實作
// router.put('/restore/:datalandmark_id', controller.restoreRecord);

router.use('/', middlewares.response);
module.exports = router;
