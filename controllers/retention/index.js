const express = require('express');
const controller = require('./retentionController');
const middlewares = require('../../middlewares');

const router = express.Router();
router.use('/', middlewares.verifyPermission);

router.get('/', controller.getRetentionTable);
router.post('/:reten_id/account/:account_id', controller.buyScheduleByAccount);
router.put('/orders/:order_id/status/:order_status', controller.updateOrderStatus);
router.get('/orders/account/:account_id', controller.getOrderInfoByAccount);
router.get('/orders/:order_id', controller.getOrderInfo);
router.use('/', middlewares.response);

module.exports = router;
