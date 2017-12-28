const sequelize = require('../../models').sequelize;
const Sequelize = require('sequelize');
const deviceGroup = require('../../models').deviceGroup;
const errorCode = require('../../errorCode/errorCode');
const commonService = require('../common/commonService');
const logger = require('../../logger');
const accountShareDeviceGroup = require('../../models').accountShareDeviceGroup;

const Op = Sequelize.Op;

exports.getDBDevGroupByAccount = account_id => deviceGroup.findAll({
  attributes: ['devgroup_id', 'devgroup_name', 'devgroup_sequence', 'devgroup_status'],
  where: {
    devgroup_owner: account_id
  }
});

exports.checkCreateDevGroup = (account_id, devgroup_name) => deviceGroup.find({
  attributes: ['devgroup_name'],
  where: {
    [Op.and]: [
      { devgroup_name},
      { devgroup_owner: account_id }
    ]
  }
});

exports.addDevGroupByAccount = params => new Promise((resolve, reject) => {
  const devgroup_id = commonService.generateUUIDByTimestamp();
  const { devgroup_name } = params;
  sequelize.transaction((t) => {
    const sql = deviceGroup.findOrCreate({
      where: {
        devgroup_name,
        devgroup_owner: params.account_id
      },
      defaults: {
        devgroup_id,
        devgroup_owner: params.account_id,
        devgroup_sequence: params.devgroup_sequence,
        devgroup_status: params.devgroup_status
      },
      transaction: t
    });
    return sql;
  }).then(dbResult => resolve(dbResult))
    .catch((error) => {
      logger.error('[devGroupDao][addDBDevGroupByAccount][ERROR]:', error);
      reject(error);
    });
});

exports.checkUpdateDevGroupName = (devgroup_id, devgroup_name, account_id) => deviceGroup.find({
  attributes: ['devgroup_name'],
  where: {
    [Op.and]: [
      {devgroup_name},
      {devgroup_owner: account_id},
      {
        [Op.not]: [
          {devgroup_id}
        ]
      }
    ]
  }
});


exports.updateDevGroupByAccount = params => new Promise((resolve, reject) => {
  const { devgroup_id, account_id } = params;
  const updateInfo = {
    devgroup_name: params.devgroup_name,
    devgroup_sequence: params.devgroup_sequence,
    devgroup_status: params.devgroup_status,
  };
  deviceGroup.update(updateInfo, {
    where: {
      devgroup_id,
      devgroup_owner: account_id
    }
  })
    .then(result => resolve(result))
    .catch(error => reject(error));
});

exports.deleteDevGroupInfo = params => new Promise((resolve, reject) => {
  const { devgroup_id, account_id } = params;
  deviceGroup.find({
    attributes: ['devgroup_id', 'devgroup_owner'],
    where: { devgroup_id, devgroup_owner: account_id }
  })
    .then(result => sequelize.transaction((t) => {
      const sql = deviceGroup.destroy({
        where: {
          devgroup_id,
          devgroup_owner: account_id
        },
        transaction: t
      });
      return sql;
    })
      .then(() => resolve(result))
      .catch(error => reject(error))
    )
    .catch(error => reject(error));
});

exports.shareDevGroup = (params) => {
  const { devgroup_id, account_id } = params;
  const accountsharedevgroup_id = commonService.generateUUIDByTimestamp();
  const sql = accountShareDeviceGroup.findOrCreate({
    where: {
      devgroup_id,
      account_id
    },
    defaults: {
      devgroup_id,
      account_id,
      accountsharedevgroup_id
    }
  });
  return sql;
};

exports.shareDevGroups = (account_id, devgroups) => sequelize.transaction((t) => {
  const promises = [];
  for (let i = 0; i < devgroups.length; i += 1) {
    const accountsharedevgroup_id = commonService.generateUUIDByTimestamp();
    const newPromise = accountShareDeviceGroup.create({
      accountsharedevgroup_id,
      account_id,
      devgroup_id: devgroups[i]
    }, { transaction: t });
    promises.push(newPromise);
  }
  return Promise.all(promises);
});

exports.deleteShareDeviceGroup = params => new Promise((resolve, reject) => {
  const { devgroup_id, account_id } = params;
  accountShareDeviceGroup.find({
    attributes: ['accountsharedevgroup_id'],
    where: { devgroup_id, account_id }
  })
    .then(result => accountShareDeviceGroup.destroy({
      where: {
        devgroup_id,
        account_id
      }
    })
      .then(() => resolve(result))
      .catch(error => reject(error))
    )
    .catch(error => reject(error));
});

exports.getShareGroupInfo = account_id => accountShareDeviceGroup.findAll({
  attributes: ['devgroup_id'],
  where: {
    account_id
  },
  include: [{
    model: deviceGroup,
    attributes: ['devgroup_name', 'devgroup_status', 'devgroup_sequence'],
    required: false
  }]
});

/**
 * check if value exist
 */
exports.checkDevgroup = devgroup_id => deviceGroup.find({
  attributes: ['devgroup_id'],
  where: {
    devgroup_id
  }
});

exports.checkDevGroups = devgroups => deviceGroup.findAll({
  attributes: ['devgroup_id'],
  where: {
    devgroup_id: {
      [Op.or]: devgroups
    }
  }
});

exports.checkDevGroupsAndOwner = (account_id, devgroups) => deviceGroup.findAll({
  attributes: ['devgroup_id'],
  where: {
    [Op.and]: [
      { devgroup_owner: account_id },
      {
        devgroup_id: {
          [Op.or]: devgroups
        }
      }
    ]
  }
});

exports.checkDuplicateShareDevGroups = (account_id, devgroups) => accountShareDeviceGroup.findAll({
  attributes: ['accountsharedevgroup_id'],
  where: {
    [Op.and]: [
      {account_id},
      {
        devgroup_id: {
          [Op.or]: devgroups
        }
      }
    ]
  }
});
