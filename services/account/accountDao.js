const logger = require('../../logger');
const models = require('../../models');
const errorCode = require('../../errorCode/errorCode');

/**
 * Create account
 * accountInfo: { account_id, account_name, account_email, account_mobile, account_password }
 */
exports.createAccount = (accountInfo) => {
  const { account_mobile, account_mobile_country_code } = accountInfo;
  return models.account.findOrCreate({
    where: { account_mobile, account_mobile_country_code },
    defaults: accountInfo
  });
};

exports.updateStatus = (account_mobile, account_mobile_country_code, account_status) => {
  return models.account.update({
    account_status,
    account_updated_time: new Date(),
  }, {
    where: { account_mobile, account_mobile_country_code }
  });
};

/**
 * get verify code and expired time by mobile
 */
exports.getVerifyCode = (account_mobile, account_mobile_country_code) => {
  return models.account.findOne({
    where: { account_mobile, account_mobile_country_code },
    attributes: [
      'verify_code',
      [models.sequelize.fn('date_format', models.sequelize.col('verify_expired_time'), '%Y-%m-%d %H:%i:%S'), 'verify_expired_time']
    ]
  });
};

/**
 * Update verify code and expired time by mobile
 */
exports.updateVerifyCode = (params) => {
  const { account_id, account_mobile, account_mobile_country_code, verify_code, verify_expired_time } = params;
  const whereObj = {};
  if (account_id) {
    Object.assign(whereObj, { account_id });
  } else {
    Object.assign(whereObj, { account_mobile, account_mobile_country_code });
  }
  return models.account.update({
    verify_code,
    verify_expired_time,
    account_updated_time: new Date(),
  }, {
    where: whereObj
  });
};

/**
 * Query Account by accountId
 */
exports.queryByAccountId = (accountId) => {
  return models.account.findOne({
    where: { account_id: accountId},
    attributes: [
      'account_id',
      'account_name',
      'account_email',
      'account_mobile',
      'account_mobile_country_code',
      'account_updated_time'
    ]
  });
};

/**
 * Query account info by mobile and password
 */
exports.queryForLogin = (account_mobile, account_mobile_country_code, account_password) => {
  return models.account.findOne({
    where: { account_mobile, account_mobile_country_code, account_password },
    attributes: ['account_id', 'account_name', 'account_email', 'account_mobile', 'account_status']
  });
};

/**
 * count for account and password
 */
exports.countForCheckPwd = (account_id, account_password) => {
  return models.account.count({
    where: { account_id, account_password }
  });
};

/**
 * update account password
 */
exports.updatePassword = ({ account_id, account_mobile, account_mobile_country_code, account_password }) => {
  const whereObj = {};
  if (account_id) {
    Object.assign(whereObj, { account_id });
  } else {
    Object.assign(whereObj, { account_mobile, account_mobile_country_code });
  }

  return models.account.update({
    account_password,
    account_updated_time: new Date(),
  }, {
    where: whereObj
  });
};

exports.updateAccountInfo = (accountId, params) => {
  const attrObj = {
    account_updated_time: params.account_updated_time
  };
  if (params.account_name) {
    Object.assign(attrObj, { account_name: params.account_name });
  }
  if (params.account_email) {
    Object.assign(attrObj, { account_email: params.account_email });
  }
  if (params.account_mobile) {
    Object.assign(attrObj, { account_mobile: params.account_mobile });
  }
  if (params.account_mobile_country_code) {
    Object.assign(attrObj, { account_mobile_country_code: params.account_mobile_country_code });
  }
  return models.account.update(attrObj, {
    where: {account_id: accountId}
  });
};

exports.isMobile = (account_mobile, account_mobile_country_code) => {
  return models.account.count({
    where: { account_mobile, account_mobile_country_code }
  });
};

exports.isAccount = (account_id) => {
  return models.account.count({
    where: { account_id }
  });
};

/**
 * check if value exist
 */
exports.checkAccount = account_id => models.account.find({
  attributes: ['account_id'],
  where: {
    account_id
  }
});
