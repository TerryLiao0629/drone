const Joi = require('joi');
const { validateFormat } = require('../../utils/validator');

exports.actions = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required(),
    datalandmark_id: Joi.string().required(),
    accountakelog_type: Joi.number().required().integer().min(0).max(1),
    accountakelog_started_time: Joi.date().required(),
    accountakelog_ended_time: Joi.date()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.restoreRecord = (value) => {
  const schema = Joi.object().keys({
    datalandmark_id: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};
