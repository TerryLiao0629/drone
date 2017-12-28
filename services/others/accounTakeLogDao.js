const logger = require('../../logger');
const models = require('../../models');

/**
 * Create accounTakeLog
 * params: { account_id, account_name, account_email, account_mobile, account_password }
 */
exports.create = params => models.accounTakeLog.create(params);
