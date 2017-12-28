const express = require('express');
const controller = require('./notificationController');
const middlewares = require('../../middlewares');

const router = express.Router();

router.use('/', middlewares.verifyPermission);
router.post('/:notification_type/:datalandmark_id', controller.pushNotification);

router.use('/', middlewares.response);
module.exports = router;
