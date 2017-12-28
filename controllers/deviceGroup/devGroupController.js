const devGroupService = require('../../services/deviceGroup/devGroupService');
const ResFormator = require('../../utils/formator');
const errorCode = require('../../errorCode/errorCode');
const validate = require('./validate');
const logger = require('../../logger');
const _ = require('lodash');

/**
 * Get Device Group By Account Id
 * request parameter : {account_id}
 */
exports.getDevGroupeInfo = (req, res, next) => {
  const validateValue = Object.assign({}, req.params);
  const validateResult = validate.getDevGroupeInfo(validateValue);
  if (validateResult.error) {
    req.ctrlResult = new ResFormator();
    req.ctrlResult.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    next();
  } else {
    const { account_id } = req.params;
    devGroupService.checkAccount(account_id)
      .then(devGroupService.getDBDevGroupByAccount)
      .then((result) => {
        req.ctrlResult = new ResFormator(result);
        next();
      })
      .catch((error) => {
        logger.error(`[devGroupController][getDevGroupeInfo][ERROR]: ${JSON.stringify(error)}`);
        req.ctrlResult = new ResFormator();
        if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
        next();
      });
  }
};

/**
 * Add Device Group By Account Id
 * request body : {devgroup_name, devgroup_sequence, devgroup_status}
 */
exports.addDevGroupeInfo = (req, res, next) => {
  const validateValue = Object.assign({}, req.params, req.body);
  const validateResult = validate.addDevGroupeInfo(validateValue);
  if (validateResult.error) {
    const resFormator = new ResFormator();
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    const { account_id } = req.params;
    const params = Object.assign({}, req.body, { account_id });
    devGroupService.checkAddDevGroupeInfo(params)
      .then(devGroupService.addDevGroupByAccount)
      .then((result) => {
        req.ctrlResult = new ResFormator(result);
        next();
      })
      .catch((error) => { // error custom object: { errorCode(string type) , error(obj type) }
        logger.error('[devGroupController][addDevGroupeInfo][ERROR]:');
        logger.error(error);
        console.log(error);
        req.ctrlResult = new ResFormator();
        if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
        next();
      });
  }
};

/**
 * Update Device Group By account_id and devicegroup_id
 * request body : {devgroup_name, devgroup_sequence, devgroup_status}
 */
exports.updateDevGroupInfo = (req, res, next) => {
  const validateValue = Object.assign({}, req.params, req.body);
  const validateResult = validate.updateDevGroupInfo(validateValue);
  const resFormator = new ResFormator();
  if (validateResult.error) {
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    const { account_id, devgroup_id } = req.params;
    const params = Object.assign({}, req.body, { account_id, devgroup_id });
    devGroupService.checkUpdateDevGroupInfo(params)
      .then(devGroupService.updateDevGroupByAccount)
      .then((result) => {
        req.ctrlResult = new ResFormator(result);
        next();
      })
      .catch((error) => {
        logger.error('[devGroupController][updateDevGroupInfo][ERROR]:');
        logger.error(error);
        req.ctrlResult = new ResFormator();
        if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
        next();
      });
  }
};

/**
 * Delete Device Group By account_id and devicegroup_id
 * request parameter : {account_id, devgroup_id}
 */
exports.deleteDevGroupInfo = (req, res, next) => {
  const validateValue = Object.assign({}, req.params);
  const validateResult = validate.deleteDevGroupInfo(validateValue);
  const resFormator = new ResFormator();
  if (validateResult.error) {
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    devGroupService.checkDeleteDevGroupInfo(req.params)
      .then(devGroupService.deleteDevGroupInfo)
      .then((result) => {
        req.ctrlResult = new ResFormator(result);
        next();
      })
      .catch((error) => { // error custom object: { errorCode(string type) , error(obj type) }
        logger.error('[devGroupController][deleteDevGroupInfo][ERROR]:');
        logger.error(error);
        req.ctrlResult = new ResFormator();
        if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
        next();
      });
  }
};

exports.shareDevGroup = (req, res, next) => {
  const validateValue = Object.assign({}, req.params);
  const validateResult = validate.shareDevGroup(validateValue);
  const resFormator = new ResFormator();
  if (validateResult.error) {
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    const params = req.params;
    devGroupService.checkShareDevGroup(params)
      .then(devGroupService.shareDevGroup)
      .then((result) => {
        logger.info('[devGroupController][shareDevGroup]:', result);
        req.ctrlResult = new ResFormator(result);
        next();
      })
      .catch((error) => {
        logger.error('[devGroupController][shareDevGroup][ERROR]:', error);
        req.ctrlResult = new ResFormator();
        if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
        next();
      });
  }
};

exports.shareDevGroups = (req, res, next) => {
  const params = Object.assign({}, req.params, req.body);
  const validateResult = validate.shareDevGroups(params);
  if (validateResult.error) {
    const resFormator = new ResFormator();
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
    return;
  }
  devGroupService.checkShareDevGroups(params)
    .then(devGroupService.checkShareDevGroupsToSelf)
    .then(devGroupService.checkDuplicateShareDevGroups)
    .then(devGroupService.shareDevGroups)
    .then((result) => {
      logger.info('[devGroupController][shareDevGroups]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error('[devGroupController][shareDevGroups][ERROR]:');
      logger.error(error);
      req.ctrlResult = new ResFormator();
      if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
      next();
    });
};

exports.deletShareDevGroup = (req, res, next) => {
  const params = req.params;
  devGroupService.checkDeleteShareDevice(params)
    .then(devGroupService.deleteShareDeviceGroup)
    .then((result) => {
      logger.info('[devGroupController][deletShareDevGroup]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error('[devGroupController][deletShareDevGroup][ERROR]:', error);
      req.ctrlResult = new ResFormator();
      if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
      next();
    });
};

exports.getShareDevGroup = (req, res, next) => {
  const { account_id } = req.params;
  devGroupService.getShareDevGroup(account_id)
    .then((result) => {
      logger.info('[devGroupController][getShareDevGroupe]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error(`[devGroupController][getShareDevGroupe][ERROR]: ${JSON.stringify(error)}`);
      req.ctrlResult = new ResFormator();
      if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
      next();
    });
};
