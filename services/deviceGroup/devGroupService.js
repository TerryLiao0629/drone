const _ = require('lodash');
const errorCode = require('../../errorCode/errorCode');
const devGroupDao = require('../deviceGroup/devGroupDao');
const accountDao = require('../account/accountDao');
const logger = require('../../logger');

exports.getDBDevGroupByAccount = account_id => new Promise((resolve, reject) => {
  devGroupDao.getDBDevGroupByAccount(account_id)
    .then((dbResult) => {
      if (_.isEmpty(dbResult)) resolve({ devicegroups: dbResult });
      const dbArray = [...dbResult].map((obj) => {
        const rObj = obj.get({
          plain: true
        }); // obj.toJSON();
        return rObj;
      });
      resolve({ devicegroups: dbArray });
    })
    .catch((error) => {
      logger.error('[devGroupService][getDBDevGroupByAccount][ERROR]:', error);
      reject(error);
    });
});

exports.addDevGroupByAccount = params => new Promise((resolve, reject) => {
  devGroupDao.addDevGroupByAccount(params)
    .then((dbResult) => {
      if (dbResult[1] === false) reject({ errorCode: errorCode.VALUE_ERROR_SAME_VALUE });
      else {
        if (_.isEmpty(dbResult[0])) reject({});
        resolve({ devgroup_id: dbResult[0].devgroup_id });
      }
    })
    .catch((error) => {
      logger.error('[devGroupService][addDevGroupByAccount][ERROR]:', error);
      reject(error);
    });
});

exports.checkAccount = account_id => new Promise((resolve, reject) => {
  accountDao.checkAccount(account_id)
    .then((searchAccount) => {
      if (_.isEmpty(searchAccount)) reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
      else resolve(account_id);
    })
    .catch((error) => {
      logger.error('[devGroupService][checkAccount][ERROR]:', error);
      reject(error);
    });
});

exports.checkAddDevGroupeInfo = params => new Promise((resolve, reject) => {
  const { account_id, devgroup_name } = params;
  accountDao.checkAccount(account_id)
    .then((searchAccount) => {
      if (_.isEmpty(searchAccount)) return Promise.reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
      return devGroupDao.checkCreateDevGroup(account_id, devgroup_name);
    })
    .then((searchDeviceName) => {
      if (!_.isEmpty(searchDeviceName)) return Promise.reject({errorCode: errorCode.SAME_DEVICEGROUP_NAME});
      return Promise.resolve();
    })
    .then(() => resolve(params))
    .catch((error) => {
      logger.error('[devGroupService][checkAddDevGroupeInfo][ERROR]:', error);
      reject(error);
    });
});

exports.checkDeleteDevGroupInfo = params => new Promise((resolve, reject) => {
  const { account_id, devgroup_id } = params;
  accountDao.checkAccount(account_id)
    .then((searchAccount) => {
      if (_.isEmpty(searchAccount)) return Promise.reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
      return devGroupDao.checkDevgroup(devgroup_id);
    })
    .then((searchDevice) => {
      if (_.isEmpty(searchDevice)) return Promise.reject({ errorCode: errorCode.INVALID_DEVICEGROUP_ID });
      return Promise.resolve();
    })
    .then(() => resolve(params))
    .catch((error) => {
      logger.error('[devGroupService][checkDeleteDevGroupInfo][ERROR]:', error);
      reject(error);
    });
});

exports.checkShareDevGroup = params => new Promise((resolve, reject) => {
  const { account_id, devgroup_id } = params;
  accountDao.checkAccount(account_id)
    .then((searchAccount) => {
      if (_.isEmpty(searchAccount)) return Promise.reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
      return devGroupDao.checkDevgroup(devgroup_id);
    })
    .then((searchDevice) => {
      if (_.isEmpty(searchDevice)) return Promise.reject({ errorCode: errorCode.INVALID_DEVICEGROUP_ID });
      return Promise.resolve();
    })
    .then(() => resolve(params))
    .catch((error) => {
      logger.error('[devGroupService][checkDeleteDevGroupInfo][ERROR]:', error);
      reject(error);
    });
});

exports.checkDeleteShareDevice = params => new Promise((resolve, reject) => {
  const { account_id, devgroup_id } = params;
  accountDao.checkAccount(account_id)
    .then((searchAccount) => {
      if (_.isEmpty(searchAccount)) return Promise.reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
      return devGroupDao.checkDevgroup(devgroup_id);
    })
    .then((searchDevice) => {
      if (_.isEmpty(searchDevice)) return Promise.reject({ errorCode: errorCode.INVALID_DEVICEGROUP_ID });
      return Promise.resolve();
    })
    .then(() => resolve(params))
    .catch((error) => {
      logger.error('[devGroupService][checkDeleteDevGroupInfo][ERROR]:', error);
      reject(error);
    });
});

exports.checkUpdateDevGroupInfo = params => new Promise((resolve, reject) => {
  const { account_id, devgroup_id, devgroup_name } = params;
  accountDao.checkAccount(account_id)
    .then((searchAccount) => {
      if (_.isEmpty(searchAccount)) return Promise.reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
      return devGroupDao.checkDevgroup(devgroup_id);
    })
    .then((searchDevice) => {
      if (_.isEmpty(searchDevice)) return Promise.reject({ errorCode: errorCode.INVALID_DEVICEGROUP_ID });
      return devGroupDao.checkUpdateDevGroupName(devgroup_id, devgroup_name, account_id); // devgroup_name cant be same
    })
    .then((searchName) => {
      if (!_.isEmpty(searchName)) return Promise.reject({errorCode: errorCode.SAME_DEVICEGROUP_NAME});
      return Promise.resolve();
    })
    .then(() => resolve(params))
    .catch((error) => {
      logger.error('[devGroupService][checkUpdateDevGroupInfo][ERROR]:', error);
      reject(error);
    });
});

exports.updateDevGroupByAccount = params => new Promise((resolve, reject) => {
  const {devgroup_id} = params;
  devGroupDao.updateDevGroupByAccount(params)
    .then((dbResult) => {
      logger.info(`[devGroupService][updateDevGroupByAccount] dbResult = ${JSON.stringify(dbResult)}`);
      if (dbResult && dbResult instanceof Array && dbResult.length > 0 && dbResult[0] !== 0) {
        resolve({ devgroup_id });
      } else {
        reject({ errorCode: errorCode.VALUE_ERROR_SAME_VALUE });
      }
    }).catch((error) => {
      logger.error('[devGroupService][updateDevGroupByAccount][ERROR]:', error);
      console.log(error);
      reject(error);
    });
});

exports.deleteDevGroupInfo = params => new Promise((resolve, reject) => {
  devGroupDao.deleteDevGroupInfo(params)
    .then((dbResult) => {
      if (dbResult !== null) {
        const { devgroup_id } = dbResult.get({ plain: true }); // to get devgroup_id
        resolve({ devgroup_id });
      } else reject({ errorCode: errorCode.METHOD_NOT_ALLOWED });
    })
    .catch((error) => {
      logger.error('[devGroupService][deleteDevGroupInfo][ERROR]:', error);
      reject(error);
    });
});

exports.shareDevGroup = params => new Promise((resolve, reject) => {
  devGroupDao.shareDevGroup(params)
    .then((dbResult) => {
      if (dbResult[1] === false) reject({ errorCode: errorCode.METHOD_NOT_ALLOWED });
      else if (_.isEmpty(dbResult[0])) reject({});
      else resolve({ accountsharedevgroup_id: dbResult[0].accountsharedevgroup_id });
    })
    .catch((error) => {
      logger.error('[devGroupService][shareDevGroup][ERROR]', error);
      reject(error);
    });
});

/*
 * check account_id if exist
 * and
 * devgroup_id in devgroups array if exist
 */
exports.checkShareDevGroups = params => new Promise((resolve, reject) => {
  const { account_id, devgroups } = params;
  accountDao.checkAccount(account_id)
    .then((searchAccount) => {
      if (_.isEmpty(searchAccount)) return Promise.reject({errorCode: errorCode.INVALID_ACCOUNT_ID});
      return devGroupDao.checkDevGroups(devgroups);
    })
    .then((searchDevGroups) => {
      if (searchDevGroups.length !== devgroups.length) return Promise.reject({errorCode: errorCode.INVALID_DEVICEGROUP_ID});
      return Promise.resolve();
    })
    .then(() => resolve(params))
    .catch((error) => {
      logger.error('[devGroupService][checkShareDevGroups][ERROR]:', error);
      console.log(error);
      reject(error);
    });
});
/**
 * check if devgroup in devgroups array its devgroup_owner equl account_id
 */
exports.checkShareDevGroupsToSelf = params => new Promise((resolve, reject) => {
  const { account_id, devgroups } = params;
  devGroupDao.checkDevGroupsAndOwner(account_id, devgroups)
    .then((searchDevGroupsAndOwner) => {
      if (searchDevGroupsAndOwner.length) reject({ errorCode: errorCode.SHARE_TO_MYSELF });
      else resolve(params);
    })
    .catch((error) => {
      console.log(error);
      reject(error);
    });
});
/**
 * check if devgroup and account_id have share relation ship in accountShareDeviceGroup table
 */
exports.checkDuplicateShareDevGroups = params => new Promise((resolve, reject) => {
  const { account_id, devgroups } = params;
  devGroupDao.checkDuplicateShareDevGroups(account_id, devgroups)
    .then((dbResult) => {
      if (dbResult.length) reject({ errorCode: errorCode.SHARE_TO_SAME_ACCOUNT_ID });
      else resolve(params);
    })
    .catch((error) => {
      console.log(error);
      reject(error);
    });
});
/**
 * share devgroup in devgroups array to account
 */
exports.shareDevGroups = params => new Promise((resolve, reject) => {
  const { account_id, devgroups } = params;
  devGroupDao.shareDevGroups(account_id, devgroups)
    .then((dbResult) => {
      if (dbResult.length > 0) resolve({});
      else reject({}); // return only timeused so return empty object to middleware
    })
    .catch((error) => {
      console.log(error);
      reject(error);
    });
});

exports.deleteShareDeviceGroup = params => new Promise((resolve, reject) => {
  devGroupDao.deleteShareDeviceGroup(params)
    .then((dbResult) => {
      if (dbResult !== null) {
        const { accountsharedevgroup_id } = dbResult.get({ plain: true }); // to get accountsharedevgroup_id
        resolve({ accountsharedevgroup_id });
      } else reject({ errorCode: errorCode.VALUE_ERROR_SAME_VALUE }); // no this data error code is ?
    })
    .catch((error) => {
      logger.error('[devGroupService][deleteShareDeviceGroup][ERROR]', error);
      reject(error);
    });
});

exports.getShareDevGroup = account_id => new Promise((resolve, reject) => {
  devGroupDao.getShareGroupInfo(account_id)
    .then((dbResult) => {
      if (_.isEmpty(dbResult)) reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
      else {
        const dbArray = [...dbResult].map((obj) => {
          const rObj = obj.get({
            plain: true
          }); // obj.toJSON();
          delete rObj.deviceGroup;
          return rObj;
        });
        dbResult.forEach((obj, index) => {
          const deviceGroupObje = dbResult[index].deviceGroup;
          dbArray[index].devgroup_name = (deviceGroupObje) ? deviceGroupObje.devgroup_name : '';
          dbArray[index].devgroup_status = (deviceGroupObje) ? deviceGroupObje.devgroup_status : '';
          dbArray[index].devgroup_sequence = (deviceGroupObje) ? deviceGroupObje.devgroup_sequence : '';
        });
        resolve({ devicegroups: dbArray });
      }
    })
    .catch((error) => {
      logger.error('[devGroupService][getShareDevGroup][ERROR]', error);
      reject(error);
    });
});

