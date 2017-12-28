const Joi = require('joi');
const { validateFormat } = require('../../utils/validator');
const commonService = require('../../services/common/commonService');

const countryCodes = commonService.countryCodes();

exports.registration = (value) => {
  const schema = Joi.object().keys({
    account_name: Joi.string().required(),
    account_email: Joi.string().email(),
    account_mobile: Joi.string().required(),
    account_mobile_country_code: Joi.string().valid(countryCodes).required(),
    account_password: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.changeStatus = (value) => {
  const schema = Joi.object().keys({
    account_mobile: Joi.string().required(),
    account_mobile_country_code: Joi.string().valid(countryCodes).required(),
    verify_code: Joi.string().required(),
    account_status: Joi.number().valid(0, 1).required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.resetPassword = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required(),
    old_password: Joi.string().required(),
    new_password: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.login = (value) => {
  const schema = Joi.object().keys({
    account_mobile: Joi.string().required(),
    account_mobile_country_code: Joi.string().valid(countryCodes).required(),
    account_password: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.forgotPassword = (value) => {
  const schema = Joi.object().keys({
    account_mobile: Joi.string().required(),
    account_mobile_country_code: Joi.string().valid(countryCodes).required(),
    verify_code: Joi.string().required(),
    new_password: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.getAccountInfo = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.modifyAccountInfo = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required(),
    account_name: Joi.string().required(),
    account_email: Joi.string().email(),
    account_mobile: Joi.string().required(),
    account_mobile_country_code: Joi.string().valid(countryCodes).required(),
    verify_code: Joi.string()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.sendCode = (value) => {
  const schema = Joi.object().keys({
    account_mobile: Joi.string().required(),
    account_mobile_country_code: Joi.string().valid(countryCodes).required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.verifyCode = (value) => {
  const schema = Joi.object().keys({
    account_mobile: Joi.string().required(),
    account_mobile_country_code: Joi.string().valid(countryCodes).required(),
    verify_code: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.sendCodeByAccount = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required(),
    account_mobile: Joi.string().required(),
    account_mobile_country_code: Joi.string().valid(countryCodes).required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.platform = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required(),
    platform_token: Joi.string().required(),
    platform_type: Joi.number().valid(1, 2, 3).required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.deletePlatform = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.pushNotification = (value) => {
  const schema = Joi.object().keys({
    device_token: Joi.string().required(),
    deviceType: Joi.string().valid(['IOS', 'ANDROID']).required(),
    message: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.jpushForAndroid = (value) => {
  const schema = Joi.object().keys({
    appKey: Joi.string().required(),
    masterSecret: Joi.string().required(),
    message: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};
