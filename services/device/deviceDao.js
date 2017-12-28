const sequelize = require('../../models').sequelize;
const Sequelize = require('sequelize');
const device = require('../../models').device;
const deviceAttribute = require('../../models').deviceAttribute;
const deviceAttributeValue = require('../../models').deviceAttributeValue;
const deviceBelongGroup = require('../../models').deviceBelongGroup;
const accountShareDevice = require('../../models').accountShareDevice;
const commonService = require('../common/commonService');
const errorCode = require('../../errorCode/errorCode');

const Op = Sequelize.Op;

exports.addDBDeviceDevgroup = (params) => {
  const { device_id, devgroup_id } = params;
  const devbgroup_id = commonService.generateUUIDByTimestamp();
  const sql = deviceBelongGroup.findOrCreate({
    where: { // one device can only has one devicegroup
      device_id,
    },
    defaults: {
      device_id,
      devgroup_id,
      devbgroup_id
    }
  });
  return sql;
};

exports.shareDevice = (params) => {
  const {device_id, account_id} = params;
  const accountsharedev_id = commonService.generateUUIDByTimestamp();
  const sql = accountShareDevice.findOrCreate({
    where: {
      device_id,
      account_id
    },
    defaults: {
      device_id,
      account_id,
      accountsharedev_id
    }
  });
  return sql;
};

exports.shareDevices = (account_id, devices) => sequelize.transaction((t) => {
  const promises = [];
  for (let i = 0; i < devices.length; i += 1) {
    const accountsharedev_id = commonService.generateUUIDByTimestamp();
    const newPromise = accountShareDevice.create({
      accountsharedev_id,
      account_id,
      device_id: devices[i]
    }, {transaction: t});
    promises.push(newPromise);
  }
  return Promise.all(promises);
});

exports.deleteShareDevice = params => new Promise((resolve, reject) => {
  const {device_id, account_id} = params;
  accountShareDevice.find({
    attributes: ['accountsharedev_id'],
    where: {device_id, account_id}
  })
    .then(result => accountShareDevice.destroy({
      where: {
        device_id,
        account_id
      }
    })
      .then(() => resolve(result))
      .catch(error => reject(error))
    )
    .catch(error => reject(error));
});

exports.createDevice = (params) => {
  const { device_id, device_name, device_ip, device_owner, device_attribute, scenemode_id, device_port, device_zone,
    device_mac, device_did, device_password, device_streaming_url} = params;
  const transaction = sequelize.transaction((t) => {
    const sql = device.create({
      device_id,
      device_name,
      device_ip,
      device_owner,
      scenemode_id,
      device_port,
      device_zone,
      device_mac,
      device_did,
      device_password,
      device_url: `${device_ip}:${device_port}`,
      device_streaming_url
    }, {transaction: t}).then(() => {
      // device_attribute to deviceAttribute & deviceAttributeValue
      if (device_attribute.length) {
        const promises = [];
        for (let i = 0; i < device_attribute.length; i += 1) {
          const attribute_id = commonService.generateUUIDByTimestamp();
          const newPromise = deviceAttribute.create({
            attribute_id,
            device_id,
            attribute_name: device_attribute[i].name
          }, {transaction: t}).then(() => {
            const attrvalue_id = commonService.generateUUIDByTimestamp();
            return deviceAttributeValue.create({
              attrvalue_id,
              attribute_id,
              attrvalue_value: device_attribute[i].value
            }, {transaction: t});
          }); // end sql
          promises.push(newPromise);
        } // end for loop
        return Promise.all(promises);
      }
      return ('NO ATTRIBUTE');
    });
    return sql;
  });
  return transaction;
};

exports.listDevgroup = devgroup_id => device.findAll({
  attributes: ['device_id', 'device_name', 'device_streaming_url'],
  include: [{
    model: deviceBelongGroup,
    attributes: [],
    where: {devgroup_id}
  }],
  raw: true
});

exports.getDeviceInfo = device_id => device.find({
  attributes: ['device_id', 'device_name', 'device_ip', 'scenemode_id',
    'device_port', 'device_zone', 'device_did', 'device_password',
  ],
  where: {
    device_id
  },
  include: [{
    model: deviceAttribute,
    attributes: ['attribute_name'],
    include: [{
      model: deviceAttributeValue,
      attributes: ['attrvalue_value'],
      required: false
    }],
    required: false
  }]
});

exports.getAttributeName = device_id => deviceAttribute.findAll({
  attributes: ['attribute_name'],
  where: {device_id},
  raw: true
});

exports.getDeviceOwner = device_id => device.find({
  attributes: ['device_id', 'device_owner'],
  where: {
    device_id
  }
});

exports.updateDevice = (params) => {
  const { device_id, device_name, device_ip, device_attribute, scenemode_id, device_port, device_zone,
    device_mac, device_did, device_password } = params;
  const deviceItem = {
    device_name,
    device_ip,
    scenemode_id,
    device_port,
    device_zone,
    device_mac,
    device_did,
    device_password,
    device_url: `${device_ip}:${device_port}`
  };
  const transaction = sequelize.transaction((t) => {
    const sql = device.update(deviceItem, {
      where: {device_id},
      transaction: t
    }).then(() => {
      // device_attribute to deviceAttribute & deviceAttributeValue
      if (device_attribute.length) {
        const promises = [];
        for (let i = 0; i < device_attribute.length; i += 1) {
          const newPromise = deviceAttribute.find({
            where: {
              device_id,
              attribute_name: device_attribute[i].name
            },
            include: [{
              model: deviceAttributeValue
            }],
            transaction: t
          })
            .then(instance => instance.deviceAttributeValue.updateAttributes({
              attrvalue_value: device_attribute[i].value
            }, { transaction: t }));
          promises.push(newPromise);
        } // end for loop
        return Promise.all(promises);
      }
      return ('NO ATTRIBUTE');
    });
    return sql;
  });
  return transaction;
};

exports.getDeviceSetting = device_id => device.find({
  attributes: ['device_id', 'device_ip', 'device_port', 'device_did', 'device_password',
    'device_streaming_url', 'scenemode_id', 'device_owner'],
  where: {device_id}
});

exports.deleteDevice = device_id => sequelize.transaction((t) => {
  // chain all your queries here. make sure you return them.
  const sql = device.destroy({
    where: {
      device_id
    },
    include: [{
      model: deviceAttribute,
      include: [{
        model: deviceAttributeValue,
        // truncate: true
      }],
      // truncate: true
    }],
    // truncate: true
    transaction: t
  });
  return sql;
});

exports.getDeviceAttributes = device_id => deviceAttribute.findAll({
  attributes: ['attribute_id', 'attribute_name', 'attribute_status', 'attribute_sequence'],
  where: {
    device_id
  },
  include: [{
    model: deviceAttributeValue,
    attributes: ['attrvalue_value'], // [[colname, alias name], colname]
    required: false
  }]
});

/*
 * checker if value exist
 */
exports.checkDevice = device_id => device.find({
  attributes: ['device_id'],
  where: {
    device_id
  }
});

exports.checkDevices = devices => device.findAll({
  attributes: ['device_id'],
  where: {
    device_id: {
      [Op.or]: devices
    }
  }
});

exports.checkDevicesAndOwner = (account_id, devices) => device.findAll({
  attributes: ['device_id'],
  where: {
    [Op.and]: [
      {device_owner: account_id},
      {
        device_id: {
          [Op.or]: devices
        }
      }
    ]
  }
});

exports.checkDuplicateShareDevices = (account_id, devices) => accountShareDevice.findAll({
  attributes: ['accountsharedev_id'],
  where: {
    [Op.and]: [
      {account_id},
      {
        device_id: {
          [Op.or]: devices
        }
      }
    ]
  }
});

exports.checkDeviceGetOwner = device_id => device.find({
  attributes: ['device_owner'],
  where: {
    device_id
  }
});

exports.checkCreateDevice = (device_name, device_mac, device_ip, device_port, device_owner) => device.findAll({
  // attributes: ['device_name', 'device_mac', 'device_ip', 'device_port'],
  attributes: [Sequelize.literal( // same device_ownder dont allow same device name
    `CASE WHEN (device_name = '${device_name}' AND device_owner = '${device_owner}') THEN "${errorCode.SAME_DEVICE_NAME}" 
          WHEN (device_mac = '${device_mac}') THEN "${errorCode.SAME_DEVICE_MAC}" 
          WHEN (device_ip = '${device_ip}' AND device_port = ${device_port}) THEN "${errorCode.SAME_DEVICE_SETTING}" 
          END AS duplicate`)],
  where: {
    [Op.or]: [
      {
        [Op.and]: [
          {device_name},
          {device_owner}
        ]
      },
      { device_mac },
      {
        [Op.and]: [
          { device_ip },
          { device_port }
        ]
      }
    ]
  },
  raw: true
});

exports.checkUpdateDevice = (device_id, device_name, device_mac, device_ip, device_port, device_owner) => device.findAll({
  attributes: [Sequelize.literal( // same device_ownder dont allow same device name but not self devcie name
    `CASE WHEN (device_name = '${device_name}' AND device_owner = '${device_owner}' AND NOT device_id = '${device_id}') THEN "${errorCode.SAME_DEVICE_NAME}" 
          WHEN (device_mac = '${device_mac}' AND NOT device_id = '${device_id}') THEN "${errorCode.SAME_DEVICE_MAC}" 
          WHEN (device_ip = '${device_ip}' AND device_port = ${device_port} AND NOT device_id = '${device_id}') THEN "${errorCode.SAME_DEVICE_SETTING}" 
          END AS duplicate`)],
  where: {
    [Op.or]: [
      {
        [Op.and]: [
          { device_name },
          { device_owner },
          {
            [Op.not]: [
              {device_id}
            ]
          }
        ]
      },
      {
        [Op.and]: [
          {device_mac},
          {
            [Op.not]: [
              {device_id}
            ]
          }
        ]
      },
      {
        [Op.and]: [
          { device_ip },
          { device_port },
          {
            [Op.not]: [
              { device_id }
            ]
          }
        ]
      }
    ]
  },
  raw: true
});

exports.findAccountShareDeviceInfoByDeviceId = device_id => accountShareDevice.findAll({
  attributes: ['account_id'],
  where: { device_id }
});
