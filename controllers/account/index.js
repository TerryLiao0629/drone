const express = require('express');
const controller = require('./accountController');
const middlewares = require('../../middlewares');

const router = express.Router();

router.use('/', middlewares.verifyPermission);

router.post('/registration', controller.registration);
router.get('/:account_id', controller.getAccountInfo);
router.put('/:account_id', controller.modifyAccountInfo);
router.post('/status', controller.changeStatus);
router.post('/login/local', controller.login);
router.put('/:account_id/resetpassword', controller.resetPassword);
router.put('/forgotpassword', controller.forgotPassword);
router.post('/code', controller.sendCode);
router.post('/:account_id/code', controller.sendCodeByAccount);
router.post('/verifycode', controller.verifyCode);
router.post('/:account_id/platform', controller.platform);
router.delete('/:account_id/platform', controller.deletePlatform);

router.use('/', middlewares.response);
module.exports = router;
