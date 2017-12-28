const Joi = require('joi');
const { validateFormat } = require('../../utils/validator');

exports.getDevGroupeInfo = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.addDevGroupeInfo = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required(),
    devgroup_name: Joi.string().regex(/[\^@,&=*'"]+/, { invert: true }).required(),
    devgroup_sequence: Joi.number().integer().required(),
    devgroup_status: Joi.number().integer().min(0).max(1)
  });
  const validator = Joi.validate(value, schema, {
    abortEarly: false
  });
  return validateFormat(validator);
};

exports.updateDevGroupInfo = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required(),
    devgroup_id: Joi.string().required(),
    devgroup_name: Joi.string().regex(/[\^@,&=*'"]+/, { invert: true }).required(),
    devgroup_sequence: Joi.number().integer().required(),
    devgroup_status: Joi.number().integer().min(0).max(1)
  });
  const validator = Joi.validate(value, schema, {
    abortEarly: false
  });
  return validateFormat(validator);
};

exports.deleteDevGroupInfo = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required(),
    devgroup_id: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, {
    abortEarly: false
  });
  return validateFormat(validator);
};

exports.shareDevGroup = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required(),
    devgroup_id: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, {
    abortEarly: false
  });
  return validateFormat(validator);
};

exports.shareDevGroups = (params) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required(),
    devgroups: Joi.array().min(1).required().items(
      Joi.string()
    )
  });
  const validator = Joi.validate(params, schema, { abortEarly: false });
  return validateFormat(validator);
};

