const validate = require('./validate');
const logger = require('../../logger');
const errorCode = require('../../errorCode/errorCode');
const ResFormator = require('../../utils/formator');
const notificationService = require('../../services/notification/notificationService');
const commonService = require('../../services/common/commonService');

exports.pushNotification = (req, res, next) => {
  const validateValue = Object.assign({}, req.params, req.body);
  logger.info('validateValue:', validateValue);
  const validateResult = validate.pushNotification(validateValue);
  if (validateResult.error) {
    req.ctrlResult = new ResFormator();
    req.ctrlResult.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    next();
  } else {
    notificationService.checkIds(validateValue)
      .then(notificationService.getSendMessageInfos)
      .then(notificationService.sendMessageAndHistory)
      .then(() => {
        req.ctrlResult = new ResFormator({});
        next();
      })
      .catch((error) => {
        req.ctrlResult = new ResFormator();
        if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
        next();
      });
  }
};

exports.jpushForAndroid = (req, res, next) => {
  const validateResult = validate.jpushForAndroid(req.body);
  if (validateResult.error) {
    req.ctrlResult = new ResFormator();
    req.ctrlResult.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    next();
  } else {
    commonService.jpushForAndroid(req.body)
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
