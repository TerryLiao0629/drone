const Joi = require('joi');
const { validateFormat } = require('../../utils/validator');

exports.buyScheduleByAccount = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required(),
    reten_id: Joi.string().required(),
    order_name: Joi.string().required(),
    order_amount: Joi.number().integer(),
    order_tax: Joi.number().integer(),
    order_address: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.updateOrderStatus = (value) => {
  const schema = Joi.object().keys({
    order_id: Joi.string().required(),
    order_status: Joi.number().integer().min(1).max(1),
    order_address: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.getOrderInfoByAccount = (value) => {
  const schema = Joi.object().keys({
    account_id: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.getOrderInfo = (value) => {
  const schema = Joi.object().keys({
    order_id: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};
