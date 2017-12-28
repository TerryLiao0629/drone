const Joi = require('joi');

exports.deviceGroup = Joi.object().keys({
  devgroup_name: Joi.string().required(),
  devgroup_sequence: Joi.number().integer().required(),
  devgroup_status: Joi.number().integer().min(0).max(1)
});
