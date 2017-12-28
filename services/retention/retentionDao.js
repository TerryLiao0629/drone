const retentions = require('../../models').retentions;

exports.getRetentionsInfo = () => retentions.findAll({
  attributes: ['reten_id', 'reten_name', 'reten_cost', 'reten_days', 'reten_sequence']
});

exports.findRetetiondaysByRetentionid = reten_id => retentions.find({
  attributes: ['reten_days'],
  where: {
    reten_id
  }
});

/*
 * checker if value exist
 */

exports.checkRetentionId = reten_id => retentions.count({
  where: {
    reten_id
  }
});

exports.checkRetenNameIsExisted = (reten_id, reten_name) => retentions.count({
  where: {
    reten_id, reten_name
  }
});
