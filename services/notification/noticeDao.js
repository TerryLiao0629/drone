const logger = require('../../logger');
const models = require('../../models');
const Sequelize = require('sequelize');

exports.checkIds = (params) => {
  logger.info('[notificationDao][checkIds]');
  const {datalandmark_id, account_id} = params;
  return models.sequelize.query(
    'SELECT datalandmark_id, device_id, '
      .concat('(SELECT COUNT(*) FROM account WHERE account_id = :account_id) AS isAccountId, ')
      .concat('(SELECT account_status FROM account WHERE account_id = :account_id) AS accountStatus ')
      .concat('FROM sceneDatalandMark WHERE datalandmark_id = :datalandmark_id '),
    {raw: true, replacements: {datalandmark_id, account_id}, type: Sequelize.QueryTypes.SELECT });
};

exports.getSendMessageInfos = (params) => {
  const {device_id, account_id} = params;
  return models.sequelize.query(
    'SELECT p.account_id, platform_token, platform_type FROM platform p '
      .concat('WHERE EXISTS ( ')
      .concat('SELECT d.account_id FROM accountShareDevice d ')
      .concat('WHERE d.device_id = :device_id AND d.account_id = p.account_id ')
      .concat('UNION ')
      .concat('SELECT a.account_id FROM account a ')
      .concat('WHERE a.account_id = :account_id AND a.account_id = p.account_id ')
      .concat(') '),
    {raw: true, replacements: {device_id, account_id}, type: Sequelize.QueryTypes.SELECT });
};

exports.create = params => models.notificationTrigger.create(params);

