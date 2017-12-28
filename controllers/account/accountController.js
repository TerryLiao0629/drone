const _ = require('lodash');
const moment = require('moment');
const validate = require('./validate');
const logger = require('../../logger');
const errorCode = require('../../errorCode/errorCode');
const ResFormator = require('../../utils/formator');
const accountService = require('../../services/account/accountService');
const commonService = require('../../services/common/commonService');

/**
 * Account registration
 * req.body: { account_name, account_email, account_mobile, account_mobile_country_code, account_password }
 * +886 912345678, +886 0912345678, +8860912345678, +886912345678
 */
exports.registration = (req, res, next) => {
  const validateResult = validate.registration(req.body);
  if (validateResult.error) {
    const resFormator = new ResFormator();
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    const account_id = commonService.generateUUIDByTimestamp();
    const params = Object.assign({}, req.body, { account_id });

    // 1.create account, 2.update verify code, 3.send verify code
    accountService.createAccount(params)
      .then(accountService.updateVerifyCode)
      .then(commonService.sendVerifyCode)
      .then(() => {
        req.ctrlResult = new ResFormator({ account_updated_time: moment().format('x') }); // Unix ms timestamp
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
 * Change account status
 * req.body: { account_mobile, account_mobile_country_code, verify_code, account_status }
 */
exports.changeStatus = (req, res, next) => {
  const validateResult = validate.changeStatus(req.body);
  if (validateResult.error) {
    const resFormator = new ResFormator();
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    const verify_time = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    const params = Object.assign({}, req.body, { verify_time, isVerify: true });

    // check verify code, update status
    accountService.checkVerifyCode(params)
      .then(accountService.updateAccountStatus)
      .then(() => {
        req.ctrlResult = new ResFormator({account_updated_time: moment().format('x')});// Unix ms timestamp
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
 * Method.GET
 * req: params: account_id 
 * return {'account_id', 'account_name', 'account_email', 'account_mobile', 'account_mobile_country_code', 'account_updated_time'}
 */
exports.getAccountInfo = (req, res, next) => {
  const validateValue = Object.assign({}, req.params);
  const validateResult = validate.getAccountInfo(validateValue);
  if (validateResult.error) {
    req.ctrlResult = new ResFormator();
    req.ctrlResult.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    next();
  } else {
    accountService.getAccountInfo(req.params.account_id)
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

/**
 * Account login
 * req.body: { account_mobile, account_mobile_country_code, account_password }
 */
exports.login = (req, res, next) => {
  const validateResult = validate.login(req.body);
  if (validateResult.error) {
    const resFormator = new ResFormator();
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    const { account_mobile, account_mobile_country_code, account_password } = req.body;

    // check password, check status
    accountService.checkLogin({ account_mobile, account_mobile_country_code, account_password })
      .then((result) => {
        const resResult = {
          account_id: result.account_id,
          account_info: {
            account_name: result.account_name,
            account_mobile: result.account_mobile,
            account_mobile_country_code: result.account_mobile_country_code,
            account_email: result.account_email
          }
        };
        req.ctrlResult = new ResFormator(resResult);
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
 * Reset account password
 * req.params: { account_id }
 * req.body: { old_password, new_password }
 */
exports.resetPassword = (req, res, next) => {
  const validateValue = Object.assign({}, req.params, req.body);
  const validateResult = validate.resetPassword(validateValue);
  if (validateResult.error) {
    const resFormator = new ResFormator();
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    const { account_id } = req.params;
    const { old_password, new_password } = req.body;

    // check old password and update new password
    accountService.checkOldPassword({ account_id, old_password, new_password })
      .then(accountService.updateAccountPassword) // by account_id
      .then(() => {
        req.ctrlResult = new ResFormator({account_updated_time: moment().format('x')}); // Unix ms timestamp
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
 * Reset account password
 * req.body: { account_mobile, account_mobile_country_code, verify_code, new_password }
 */
exports.forgotPassword = (req, res, next) => {
  const verify_time = moment().utc().format('YYYY-MM-DD HH:mm:ss');
  const validateResult = validate.forgotPassword(req.body);
  if (validateResult.error) {
    const resFormator = new ResFormator();
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
  } else {
    const params = Object.assign({}, req.body, { verify_time, isVerify: true });

    // check verify code, update status
    accountService.checkVerifyCode(params)
      .then(accountService.updateAccountPassword) // by account_mobile
      .then(() => {
        req.ctrlResult = new ResFormator({account_updated_time: moment().format('x')}); // Unix ms timestamp
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
 * Method.PUT
 * req: params: account_id, 
 *      body: Required-user_name, Required-user_mobile, Optional-user_email
 * return {account_updated_time}
 */
exports.modifyAccountInfo = (req, res, next) => {
  const verify_time = moment().utc().format('YYYY-MM-DD HH:mm:ss');
  const validateValue = Object.assign({}, req.params, req.body);
  const validateResult = validate.modifyAccountInfo(validateValue);
  if (validateResult.error) {
    req.ctrlResult = new ResFormator();
    req.ctrlResult.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    next();
  } else {
    const accountId = req.params.account_id;
    const body = req.body;
    logger.info('controller modifyAccountInfo');
    accountService.getAccountInfo(accountId)
      .then(accountInfo => new Promise((resolve, reject) => {
        const oldMobile = accountInfo.account_mobile_country_code + accountInfo.account_mobile;
        const newMobile = body.account_mobile_country_code + body.account_mobile;
        if (!newMobile || newMobile === oldMobile) {
          // 直接更新資料
          Object.assign(accountInfo, { isVerify: false });
          resolve(accountInfo);
        } else {
          // 修改手機，要驗證新手機是否已經註冊過，且必須驗證認證碼
          accountService.isMobile({
            checkExist: false,
            account_mobile: body.account_mobile,
            account_mobile_country_code: body.account_mobile_country_code
          }).then(() => {
            Object.assign(accountInfo, {
              verify_code: body.verify_code,
              verify_time,
              isVerify: true
            });
            resolve(accountInfo);
          }).catch((error) => {
            reject(error);
          });
        }
      }))
      .then(accountInfo => accountService.checkVerifyCode(accountInfo)) // 驗證認證碼
      .then(accountInfo => accountService.modifyAccountInfo(accountInfo.account_id, body))
      .then((resData) => {
        req.ctrlResult = new ResFormator(resData);
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
 * Method.POST
 * req: body { account_mobile, account_mobile_country_code }
 * return 
 */
exports.sendCode = (req, res, next) => {
  const validateResult = validate.sendCode(req.body);
  if (validateResult.error) {
    req.ctrlResult = new ResFormator();
    req.ctrlResult.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    next();
  } else {
    const params = Object.assign({}, req.body, { checkExist: true });
    accountService.isMobile(params)
      .then(result => accountService.updateVerifyCode(result))
      .then(result => commonService.sendVerifyCode(result))
      .then((result) => {
        const { verify_expired_time } = result;
        const unixVerifyExpiredTime = moment(verify_expired_time).unix(Number);
        req.ctrlResult = new ResFormator({verify_expired_time: unixVerifyExpiredTime});
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
 * Method.POST
 * req: body { account_mobile, account_mobile_country_code, verify_code }
 * return 
 */
exports.verifyCode = (req, res, next) => {
  const validateResult = validate.verifyCode(req.body);
  if (validateResult.error) {
    req.ctrlResult = new ResFormator();
    req.ctrlResult.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    next();
  } else {
    const params = req.body;
    const verify_time = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    Object.assign(params, {verify_time, isVerify: true});
    accountService.checkVerifyCode(params)
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

/**
 * Method.POST
 * req: params: account_id
 *      body { account_mobile, account_mobile_country_code }
 * return 
 */
exports.sendCodeByAccount = (req, res, next) => {
  const validateValue = Object.assign({}, req.params, req.body);
  const validateResult = validate.sendCodeByAccount(validateValue);
  if (validateResult.error) {
    req.ctrlResult = new ResFormator();
    req.ctrlResult.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    next();
  } else {
    accountService.updateVerifyCode(validateValue)
      .then(commonService.sendVerifyCode)
      .then((result) => {
        const { verify_expired_time } = result;
        req.ctrlResult = new ResFormator({ verify_expired_time: moment(verify_expired_time).format('x') });
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
 * Method.POST
 * req: params: account_id
 *      body { platform_token, platform_type }
 * return 
 */
exports.platform = (req, res, next) => {
  const validateValue = Object.assign({}, req.params, req.body);
  const validateResult = validate.platform(validateValue);
  if (validateResult.error) {
    req.ctrlResult = new ResFormator();
    req.ctrlResult.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    next();
  } else {
    const validateTarget = JSON.parse(req.headers.authorization.slice(4));
    const {app_id} = validateTarget;
    Object.assign(validateValue, {app_id});
    accountService.isAccount(validateValue)
      .then(accountService.findPlatformByAccountId)
      .then(accountService.platform)
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

/**
 * Method.DELETE
 * req: params: account_id
 * return 
 */
exports.deletePlatform = (req, res, next) => {
  const validateResult = validate.deletePlatform(req.params);
  if (validateResult.error) {
    req.ctrlResult = new ResFormator();
    req.ctrlResult.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    next();
  } else {
    const {account_id} = req.params;
    accountService.deletePlatform(account_id)
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
