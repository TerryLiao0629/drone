const ResFormator = require('../../utils/formator');
const logger = require('../../logger');
const validate = require('./validate');
const errorCode = require('../../errorCode/errorCode');
const commonService = require('../../services/common/commonService');
const retentionService = require('../../services/retention/retentionService');

exports.getRetentionTable = (req, res, next) => {
  retentionService.getRetentionsInfo()
    .then((result) => {
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error('[retentionController][getRetentionsInfo][Error]:', error);
      req.ctrlResult = new ResFormator();
      if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
      next();
    });
};

exports.buyScheduleByAccount = (req, res, next) => {

  const resFormator = new ResFormator();
  const account_id = req.params.account_id;
  const reten_id = req.params.reten_id;
  const order_name = req.body.order_name;
  const order_amount = req.body.order_amount;
  const order_tax = req.body.order_tax;
  const order_address = req.body.order_address;
  const order_id = commonService.generateUUIDByTimestamp();
  const validateResult = validate.buyScheduleByAccount({ account_id, reten_id, order_name, order_amount, order_tax, order_address }, order_id);

  if (validateResult.error) {
    logger.error(`[retentionController][buyScheduleByAccount][PARAMETER_ERROR]: ${validateResult.error.message}`);
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    const params = Object.assign(req.body, req.params, { order_id });
    retentionService.checkRetentionId(params)
      .then(retentionService.checkAccount)
      .then(retentionService.checkRetenNameIsExisted)
      .then(retentionService.checkAlreadyBuy)
      .then(retentionService.findRetetiondaysByRetentionid)
      .then((result) => {
        // retentionService.createOrderInfo(params).then((result) => {
        req.ctrlResult = new ResFormator(result);
        next();
      })
      .catch((error) => {
        req.ctrlResult = new ResFormator();
        if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
        next();
      });
  }
};

exports.updateOrderStatus = (req, res, next) => {

  const resFormator = new ResFormator();
  const order_id = req.params.order_id;
  const order_status = req.params.order_status;
  const order_address = req.body.order_address;
  const validateResult = validate.updateOrderStatus({order_id, order_status, order_address});

  if (validateResult.error) {
    logger.error(`[retetionController][updateOrderStatus][PARAMETER_ERROR]: ${validateResult.error.message}`);
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    const params = Object.assign(req.body, req.params);
    retentionService.checkOrderId(params)
      .then(retentionService.updateOrderInfo)
      .then((result) => {
        req.ctrlResult = new ResFormator(result);
        next();
      })
      .catch((error) => {
        req.ctrlResult = new ResFormator();
        if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
        next();
      });
  }
};

exports.getOrderInfoByAccount = (req, res, next) => {
  const resFormator = new ResFormator();
  const account_id = req.params.account_id;
  const validateResult = validate.getOrderInfoByAccount(req.params);
  if (validateResult.error) {
    logger.error(`[retetionController][getOrderInfoByAccount][PARAMETER_ERROR]: ${validateResult.error.message}`);
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    retentionService.checkOrderAccountId(account_id)
      .then(retentionService.accountOrderInfo)
      .then((result) => {
        req.ctrlResult = new ResFormator(result);
        next();
      })
      .catch((error) => {
        req.ctrlResult = new ResFormator();
        if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
        next();
      });
  }
};

exports.getOrderInfo = (req, res, next) => {
  const resFormator = new ResFormator();
  const order_id = req.params.order_id;
  const validateResult = validate.getOrderInfo(req.params);
  if (validateResult.error) {
    logger.error(`[retetionController][getOrderInfo][PARAMETER_ERROR]: ${validateResult.error.message}`);
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    retentionService.getOrderInfo(order_id).then((result) => {
      req.ctrlResult = new ResFormator(result);
      next();
    })
      .catch((error) => {
        req.ctrlResult = new ResFormator();
        if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
        next();
      });
  }
};
