const validate = require('./validate');
const logger = require('../../logger');
const errorCode = require('../../errorCode/errorCode');
const ResFormator = require('../../utils/formator');
const commonService = require('../../services/common/commonService');
const othersService = require('../../services/others/othersService');

/**
 * actions
 * req.body: { account_id, datalandmark_id, accountakelog_type, 
 *             accountakelog_started_time, accountakelog_ended_time }
 */
exports.actions = (req, res, next) => {
  logger.info('[others][actions]parameter:', req.body);
  const validateResult = validate.actions(req.body);
  if (validateResult.error) {
    const resFormator = new ResFormator();
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    const accountakelog_id = commonService.generateUUIDByTimestamp();
    const params = Object.assign({}, { accountakelog_id }, req.body);
    othersService.createActions(params)
      .then((result) => {
        req.ctrlResult = new ResFormator({accountakelog_id: result.accountakelog_id});
        next();
      })
      .catch((error) => {
        req.ctrlResult = new ResFormator();
        if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
        next();
      });
  }
};

/**
 * restore Record
 * req.params: datalandmark_id
 */
exports.restoreRecord = (req, res, next) => {
  const validateValue = Object.assign({}, req.params);
  const validateResult = validate.restoreRecord(validateValue);
  if (validateResult.error) {
    const resFormator = new ResFormator();
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    othersService.checkDataLanMarkId(validateValue)
      .then(othersService.restoreVideoRecord)
      .then(othersService.restorePhotoRecord)
      .then((result) => {
        const {datalandmark_id} = result;
        req.ctrlResult = new ResFormator({datalandmark_id});
        next();
      })
      .catch((error) => {
        req.ctrlResult = new ResFormator();
        if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
        next();
      });
  }
};
