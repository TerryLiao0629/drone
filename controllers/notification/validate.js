const Joi = require('joi');
const { validateFormat } = require('../../utils/validator');

exports.pushNotification = (value) => {
  const schema = Joi.object().keys({
    notification_type: Joi.string().valid(['email', 'sms', 'platform', 'jpush']).required(),
    datalandmark_id: Joi.string().required(),
    account_id: Joi.string().required(),
    device_id: Joi.string().required(),
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
