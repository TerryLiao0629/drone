const moment = require('moment');
const logger = require('../../logger');
const errorCode = require('../../errorCode/errorCode');
const { generateVerifyCode } = require('../../services/common/commonService');
const accountDao = require('../../services/account/accountDao');
const platformDao = require('../../services/account/platformDao');
const commonService = require('../../services/common/commonService');

/**
 * Create account (status: diable)
 */
exports.createAccount = params => new Promise((resolve, reject) => {
  accountDao.createAccount(params)
    .then((result) => {
      if (result) {
        if (result[1]) { // false means mobile already exist
          resolve(params);
        } else {
          reject({ errorCode: errorCode.SAME_USER_MOBILE });
        }
      } else {
        reject({ errorCode: errorCode.INTERNAL_ERROR });
      }
    })
    .catch((error) => {
      reject(error);
    });
});

/**
 * Update verify code and expired time
 */
exports.updateVerifyCode = params => new Promise((resolve, reject) => {
  const verifyCodeObj = generateVerifyCode();
  const { verify_code, verify_expired_time } = verifyCodeObj;
  const { account_id, account_mobile, account_mobile_country_code } = params;
  const updateParams = {
    account_id,
    account_mobile,
    account_mobile_country_code,
    verify_code,
    verify_expired_time
  };
  accountDao.updateVerifyCode(updateParams)
    .then((result) => {
      if (result) {
        if (result[0] > 0) { // update row count
          Object.assign(params, { verify_code, verify_expired_time });
          resolve(params);
        } else {
          reject({ errorCode: errorCode.INVALID_USER_MOBILE });
        }
      } else {
        reject({ errorCode: errorCode.INTERNAL_ERROR });
      }
    })
    .catch((error) => {
      reject(error);
    });
});

/**
 * Check verify code and expired time
 */
exports.checkVerifyCode = params => new Promise((resolve, reject) => {
  const { account_mobile, account_mobile_country_code, verify_code, verify_time, isVerify } = params;
  if (isVerify) {
    accountDao.getVerifyCode(account_mobile, account_mobile_country_code)
      .then((result) => {
        if (result) {
          if (verify_code !== result.verify_code) { // check if verify code match
            reject({ errorCode: errorCode.INVALID_VERIFY_CODE });
          } else if (moment(result.verify_expired_time).isBefore(verify_time)) { // check if verify code time expired
            reject({ errorCode: errorCode.VERIFY_CODE_TIMEOUT });
          } else {
            resolve(params);
          }
        } else {
          reject({ errorCode: errorCode.INVALID_USER_MOBILE });
        }
      })
      .catch((error) => {
        reject(error);
      });
  } else {
    resolve(params);
  }
});

/**
 * Update account status
 */
exports.updateAccountStatus = params => new Promise((resolve, reject) => {
  const { account_mobile, account_mobile_country_code, account_status } = params;
  accountDao.updateStatus(account_mobile, account_mobile_country_code, account_status)
    .then((result) => {
      if (result) {
        if (result[0] > 0) {
          resolve(params);
        } else {
          reject({ errorCode: errorCode.INVALID_USER_MOBILE });
        }
      } else {
        reject({ errorCode: errorCode.INTERNAL_ERROR });
      }
    })
    .catch((error) => {
      reject(error);
    });
});

/**
 * get AccountInfo by account_id
 */
exports.getAccountInfo = accountId => new Promise((resolve, reject) => {
  logger.info('service getAccountInfo');
  accountDao.queryByAccountId(accountId)
    .then((result) => {
      const resultJson = result.toJSON();
      logger.info('service getAccountInfo resultJson:', resultJson);
      if (resultJson !== null) {
        resolve(resultJson);
      } else {
        reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
      }
    })
    .catch((error) => {
      reject(error);
    });
});

/**
 * check account password and status(enable)
 */
exports.checkLogin = params => new Promise((resolve, reject) => {
  const { account_mobile, account_mobile_country_code, account_password } = params;
  accountDao.queryForLogin(account_mobile, account_mobile_country_code, account_password)
    .then((result) => {
      if (result) {
        if (result.account_status === 1) { // enable
          resolve({
            account_mobile,
            account_mobile_country_code,
            account_id: result.account_id,
            account_name: result.account_name,
            account_email: result.account_email
          });
        } else {
          reject({ errorCode: errorCode.INVALID_ACCOUNT_STATUS_DISABLE });
        }
      } else {
        reject({ errorCode: errorCode.ERROR_PASSWORD_OR_USER_MOBILE });
      }
    })
    .catch((error) => {
      reject(error);
    });
});

/**
 * check account password by account id
 */
exports.checkOldPassword = params => new Promise((resolve, reject) => {
  const { account_id, old_password } = params;
  // TODO: encode old password to match
  accountDao.countForCheckPwd(account_id, old_password)
    .then((result) => {
      if (result > 0) {
        resolve(params);
      } else {
        reject({ errorCode: errorCode.ERROR_PASSWORD_OR_ACCOUNT_ID });
      }
    })
    .catch((error) => {
      reject(error);
    });
});

/**
 * update account password by account id
 */
exports.updateAccountPassword = params => new Promise((resolve, reject) => {
  const { account_id, account_mobile, account_mobile_country_code, new_password } = params;

  // TODO: encode new password to save
  if (account_id || (account_mobile && account_mobile_country_code)) {
    accountDao.updatePassword({ account_id, account_mobile, account_mobile_country_code, account_password: new_password })
      .then((result) => {
        if (result) {
          if (result[0] > 0) {
            resolve(params);
          } else if (account_id) {
            reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
          } else {
            reject({ errorCode: errorCode.INVALID_USER_MOBILE });
          }
        } else {
          reject({ errorCode: errorCode.INTERNAL_ERROR });
        }
      })
      .catch((error) => {
        reject(error);
      });
  } else {
    reject({ errorCode: errorCode.INTERNAL_ERROR });
  }
});

exports.modifyAccountInfo = (accountId, params) => new Promise((resolve, reject) => {
  logger.info('service modifyAccountInfo');
  const account_updated_time = new Date();
  Object.assign(params, account_updated_time);
  accountDao.updateAccountInfo(accountId, params)
    .then((result) => {
      if (result) {
        if (result[0] > 0) {
          const result_updated_time = moment(account_updated_time).unix(Number);
          const resData = {account_updated_time: result_updated_time};
          resolve(resData);
        } else {
          reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
        }
      } else {
        reject({ errorCode: errorCode.INTERNAL_ERROR });
      }
    })
    .catch((error) => {
      reject(error);
    });
});

/**
 * 檢查手機號碼是否存在
 * params: { account_mobile, account_mobile_country_code, checkExist }
 * checkExist: true 檢查是否存在, false 檢查是否不存在
 */
exports.isMobile = params => new Promise((resolve, reject) => {
  const { account_mobile, account_mobile_country_code, checkExist } = params;
  accountDao.isMobile(account_mobile, account_mobile_country_code)
    .then((result) => {
      if (checkExist && (result === 0)) { // 檢查mobile是否存在，result為count=0表示不存在
        reject({ errorCode: errorCode.INVALID_USER_MOBILE });
      } else if (!checkExist && (result > 0)) { // 檢查mobile是否不存在，result為count>0表示存在
        reject({ errorCode: errorCode.SAME_USER_MOBILE });
      } else {
        resolve(params);
      }
    })
    .catch((error) => {
      reject(error);
    });
});

exports.isAccount = params => new Promise((resolve, reject) => {
  accountDao.isAccount(params.account_id)
    .then((result) => {
      if (result === 0) {
        reject({errorCode: errorCode.INVALID_ACCOUNT_ID});
      } else {
        resolve(params);
      }
    })
    .catch((error) => {
      reject(error);
    });
});

exports.findPlatformByAccountId = params => new Promise((resolve, reject) => {
  logger.info('findPlatformByAccountId');
  platformDao.findPlatformByAccountId(params.account_id)
    .then((result) => {
      if (result === 0) {
        Object.assign(params, {action: 'insert'});
        resolve(params);
      } else {
        Object.assign(params, {action: 'update'});
        resolve(params);
      }
    })
    .catch((error) => {
      reject(error);
    });
});

exports.platform = params => new Promise((resolve, reject) => {
  const {action} = params;
  if (action === 'insert') {
    const platform_id = commonService.generateUUIDByTimestamp();
    Object.assign(params, {platform_id});
    logger.info('insert platform params:', params);
    platformDao.create(params)
      .then((result) => {
        const resultJson = result.toJSON();
        if (resultJson !== null) {
          resolve(resultJson);
        } else {
          reject({ errorCode: errorCode.INTERNAL_ERROR });
        }
      })
      .catch((error) => {
        reject(error);
      });
  } else {
    logger.info('update platform params:', params);
    const platform_updated_time = moment.utc();
    Object.assign(params, {platform_updated_time});
    platformDao.updateByAccountId(params)
      .then((result) => {
        if (result) {
          if (result[0] > 0) {
            resolve(params);
          } else {
            reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
          }
        } else {
          reject({ errorCode: errorCode.INTERNAL_ERROR });
        }
      })
      .catch((error) => {
        reject(error);
      });
  }
});

exports.deletePlatform = account_id => new Promise((resolve, reject) => {
  logger.info('deletePlatform');
  platformDao.deleteByAccountId(account_id)
    .then((result) => {
      if (result > 0) {
        resolve('');
      } else {
        reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
      }
    })
    .catch((error) => {
      reject(error);
    });
});
