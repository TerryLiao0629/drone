const express = require('express');
const controller = require('./deviceController');
const middlewares = require('../../middlewares');

const router = express.Router();
router.use('/', middlewares.verifyPermission);

router.post('/:device_id/device-group/:devgroup_id', controller.addDeviceDevgroup);
router.post('/:device_id/share/account/:account_id', controller.shareDevice);
router.post('/share/account/:account_id', controller.shareDevices);
router.delete('/:device_id/share/account/:account_id', controller.deleteShareDevice);
router.post('/', controller.createDevice);
router.get('/device-group/:devgroup_id', controller.listDevgroup);
router.get('/:device_id', controller.getDeviceInfo);
router.put('/:device_id', controller.updateDevice);
router.delete('/:device_id', controller.deleteDevice);
router.get('/:device_id/attributes', controller.getAttributes);
// through middleware to response result
router.use('/', middlewares.response);
module.exports = router;
