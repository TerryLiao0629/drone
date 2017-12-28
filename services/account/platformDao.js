const models = require('../../models');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

exports.create = params => models.platform.create(params);

exports.updateById = (scedp_id, params) => {
  const {app_id, account_id, platform_token, platform_type,
    platform_created_time, platform_updated_time} = params;
  const attrObj = {};
  if (Object.prototype.hasOwnProperty.call(params, 'app_id')) {
    Object.assign(attrObj, { app_id });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'account_id')) {
    Object.assign(attrObj, { account_id });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'platform_token')) {
    Object.assign(attrObj, { platform_token });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'platform_type')) {
    Object.assign(attrObj, { platform_type });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'platform_created_time')) {
    Object.assign(attrObj, { platform_created_time });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'platform_updated_time')) {
    Object.assign(attrObj, { platform_updated_time });
  }
  return models.platform.update(attrObj, {
    where: {scedp_id}
  });
};

exports.findPlatformByAccountId = account_id => models.platform.count({
  where: { account_id }
});

exports.updateByAccountId = (params) => {
  const {app_id, account_id, platform_token, platform_type,
    platform_updated_time} = params;
  const attrObj = {};
  if (Object.prototype.hasOwnProperty.call(params, 'app_id')) {
    Object.assign(attrObj, { app_id });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'platform_token')) {
    Object.assign(attrObj, { platform_token });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'platform_type')) {
    Object.assign(attrObj, { platform_type });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'platform_updated_time')) {
    Object.assign(attrObj, { platform_updated_time });
  }
  return models.platform.update(attrObj, {
    where: {account_id}
  });
};

exports.deleteByAccountId = account_id => models.platform.destroy({
  where: {account_id}
});

