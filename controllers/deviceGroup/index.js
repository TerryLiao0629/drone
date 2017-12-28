const express = require('express');
const controller = require('./devGroupController');
const middlewares = require('../../middlewares');

const router = express.Router();
router.use('/', middlewares.verifyPermission);

router.get('/account/:account_id', controller.getDevGroupeInfo);
router.post('/account/:account_id', controller.addDevGroupeInfo);
router.put('/:devgroup_id/account/:account_id', controller.updateDevGroupInfo);
router.delete('/:devgroup_id/account/:account_id', controller.deleteDevGroupInfo);
router.post('/:devgroup_id/share/account/:account_id', controller.shareDevGroup);
router.post('/share/account/:account_id', controller.shareDevGroups);
router.delete('/:devgroup_id/share/account/:account_id', controller.deletShareDevGroup);
router.get('/share/account/:account_id', controller.getShareDevGroup);
// through middleware to response result
router.use('/', middlewares.response);
module.exports = router;
