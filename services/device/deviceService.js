const _ = require('lodash');
const errorCode = require('../../errorCode/errorCode');
const deviceDao = require('./deviceDao');
const devGroupDao = require('../deviceGroup/devGroupDao');
const accountDao = require('../account/accountDao');
const WowzaAPIWrapper = require('../common/wowza/wowzaAPIWrapper');
const logger = require('../../logger');
const has = require('has');
const commonService = require('../common/commonService');

const configInfo = commonService.getConfigInfo();

const demoDevice = configInfo.wowza.demoDevice;
exports.STREAM_ERROR_PHASE = {
  RECORD: 'record',
  DATABASE: 'database'
};

exports.STREAM_STATUS = {
  exist: 'exist',
  notExist: 'notExist',
  connect: 'connect',
  notConnect: 'notConnect',
  recording: 'recording',
  waitForStream: 'waitForStream'
};

/**
 * check if device_id and deviceGroup exist, resolve(params)
 */
exports.checkDeviceDevgroup = params => new Promise((resolve, reject) => {
  const {device_id, devgroup_id} = params;
  deviceDao.checkDevice(device_id)
    .then((searchDevice) => {
      if (!searchDevice) return Promise.reject({errorCode: errorCode.INVALID_DEVICE_ID}); // device_id not exist
      return devGroupDao.checkDevgroup(devgroup_id);
    })
    .then((searchDevgroup) => {
      if (!searchDevgroup) return Promise.reject({errorCode: errorCode.INVALID_DEVICEGROUP_ID});
      return Promise.resolve();
    })
    .then(() => resolve(params)) // reason at line 86 comment
    .catch((error) => {
      logger.error('[deviceService][checkDeviceDevgroup][ERROR]:', error);
      console.log(error);
      reject(error);
    });
});

exports.addDeviceDevgroup = params => new Promise((resolve, reject) => {
  deviceDao.addDBDeviceDevgroup(params)
    .then((dbResult) => {
      if (dbResult[1] === false) reject({ errorCode: errorCode.METHOD_NOT_ALLOWED });
      else if (_.isEmpty(dbResult[0])) reject({});
      else resolve({ devbgroup_id: dbResult[0].devbgroup_id });
    })
    .catch((error) => {
      logger.error('[deviceService][addDeviceDevgroup][ERROR]');
      console.log(error);
      reject(error);
    });
});

exports.checkShareDevice = params => new Promise((resolve, reject) => {
  const {device_id, account_id} = params;
  accountDao.checkAccount(account_id)
    .then((searchAccount) => {
      if (_.isEmpty(searchAccount)) return Promise.reject({errorCode: errorCode.INVALID_ACCOUNT_ID});
      return deviceDao.checkDevice(device_id);
    })
    .then((searchDevice) => {
      if (_.isEmpty(searchDevice)) return Promise.reject({errorCode: errorCode.INVALID_DEVICE_ID});
      return Promise.resolve();
    })
    .then(() => resolve(params)) // reason at line 86 comment
    .catch((error) => {
      logger.error('[deviceService][checkShareDevice][ERROR]:', error);
      reject(error);
    });
});
/*
 * check account_id if exist
 * and
 * device_id in devices array if exist
 */
exports.checkShareDevices = params => new Promise((resolve, reject) => {
  const {account_id, devices} = params;
  accountDao.checkAccount(account_id)
    .then((searchAccount) => {
      // if (_.isEmpty(searchAccount)) throw new ErrorFormator(errorCode.INVALID_ACCOUNT_ID);
      if (_.isEmpty(searchAccount)) return Promise.reject({errorCode: errorCode.INVALID_ACCOUNT_ID});
      return deviceDao.checkDevices(devices);
    })
    .then((searchDevices) => {
      if (searchDevices.length !== devices.length) return Promise.reject({ errorCode: errorCode.INVALID_DEVICE_ID });
      return Promise.resolve(); // origin : resolve(params);  but ESLint will error: [eslint] Expected to return a value at the end of arrow function. (consistent-return)
    })
    .then(() => resolve(params)) // reason at line 86 comment
    .catch((error) => {
      logger.error('[deviceService][checkShareDevices][ERROR]');
      console.log(error);
      reject(error);
    });
});
/**
 * check if device in devices array its device_owner equl account_id
 */
exports.checkShareDeviceToSelf = params => new Promise((resolve, reject) => {
  const {account_id, devices} = params;
  deviceDao.checkDevicesAndOwner(account_id, devices)
    .then((searchDevicesAndOwner) => {
      if (searchDevicesAndOwner.length) reject({ errorCode: errorCode.SHARE_TO_MYSELF});
      else resolve(params);
    })
    .catch((error) => {
      logger.error('[deviceService][checkShareDeviceToSelf][ERROR]');
      console.log(error);
      reject(error);
    });
});
/**
 * check if device and account_id have share relation ship in accountShareDevice table
 */
exports.checkDuplicateShareDevices = params => new Promise((resolve, reject) => {
  const {account_id, devices} = params;
  deviceDao.checkDuplicateShareDevices(account_id, devices)
    .then((dbResult) => {
      if (dbResult.length) reject({ errorCode: errorCode.SHARE_TO_SAME_ACCOUNT_ID});
      else resolve(params);
    })
    .catch((error) => {
      logger.error('[deviceService][checkDuplicateShareDevices][ERROR]');
      console.log(error);
      reject(error);
    });
});

/**
 * share device in devices array to account
 */
exports.shareDevices = params => new Promise((resolve, reject) => {
  const {account_id, devices} = params;
  deviceDao.shareDevices(account_id, devices)
    .then((dbResult) => {
      if (dbResult.length > 0) resolve({});
      else reject({}); // return only timeused so return empty object to middleware
    })
    .catch((error) => {
      logger.error('[deviceService][shareDevices][ERROR]');
      console.log(error);
      reject(error);
    });
});

exports.shareDevice = params => new Promise((resolve, reject) => {
  deviceDao.shareDevice(params)
    .then((dbResult) => {
      if (dbResult[1] === false) reject({ errorCode: errorCode.METHOD_NOT_ALLOWED });
      else if (_.isEmpty(dbResult[0])) reject({});
      else resolve({ accountsharedev_id: dbResult[0].accountsharedev_id });
    })
    .catch((error) => {
      logger.error('[deviceService][shareDevice][ERROR]');
      console.log(error);
      reject(error);
    });
});

exports.deleteShareDevice = params => new Promise((resolve, reject) => {
  deviceDao.deleteShareDevice(params)
    .then((dbResult) => {
      if (dbResult !== null) {
        const { accountsharedev_id } = dbResult.get({ plain: true }); // to get accountsharedev_id
        resolve({ accountsharedev_id });
      } else reject({ errorCode: errorCode.BAD_ARGUMENTS }); // no this data error code is ?
    })
    .catch((error) => {
      logger.error('[deviceService][deleteShareDevice][ERROR]');
      console.log(error);
      reject(error);
    });
});

exports.checkCreateDevice = params => new Promise((resolve, reject) => {
  const {device_name, device_mac, device_ip, device_port, device_owner} = params;
  accountDao.checkAccount(device_owner)
    .then((searchAccount) => {
      if (_.isEmpty(searchAccount)) return Promise.reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
      return deviceDao.checkCreateDevice(device_name, device_mac, device_ip, device_port, device_owner);
    })
    .then((result) => {
      if (_.isEmpty(result)) resolve(params);
      else {
        // [{duplicate: "ERRORCODE"}, {duplicate: "ERRORCODE"}, {duplicate: "ERRORCODE"}] to "ERRORCODE1,ERRORCODE2"
        const errorString = _.uniq(result.map(o => o.duplicate)).join();
        // const arr = _.join(_.uniq(_.map(result, o => o.duplicate)));
        reject({errorCode: errorString});
      }
    }).catch(error => reject(error));
});

exports.createDevice = params => new Promise((resolve, reject) => {
  const {device_id} = params;
  deviceDao.createDevice(params)
    .then((result) => {
      if (result === 'NO ATTRIBUTE' || result.length > 0) resolve({device_id});
      else reject({});
    })
    .catch((error) => {
      logger.error('[deviceService][createDevice][ERROR]');
      logger.error(JSON.stringify(error));
      reject(error);
    });
});

/**
 * check if stream file exist
 * @param {string} streamfileName:  ${device_id} as usual
 * resolve {string} exist/ notExist
 */
exports.checkStreamFileExist = streamfileName => new Promise((resolve, reject) => {
  WowzaAPIWrapper.checkServiceWowzaSingleton()
    .then((wowza) => {
      wowza.getStreamFilesByName(demoDevice.appName, streamfileName)
        .then((result) => { // exist : {StreamFile: {...}} ; not exist : {error: {..., code: 4XX, message}}
          logger.info('[deviceService][checkStreamFileExist]');
          logger.info(result);
          if (has(result, 'StreamFile')) resolve(this.STREAM_STATUS.exist);
          else resolve(this.STREAM_STATUS.notExist); // not exist
        })
        .catch((error) => {
          logger.error('[deviceService][checkStreamFileExist][Error]', error);
          console.log(error);
          reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
        });
    })
    .catch((error) => {
      logger.error('[deviceService][checkStreamFileExist][Error]', error);
      console.log(error);
      reject({errorCode: errorCode.STREAM_SERVER_ERROR});
    });
});

/**
 * get stream file info
 * @param {string} streamfileName:  ${device_id} as usual
 * resolve {object} stream file info
 */
exports.getStreamFilesByName = streamfileName => new Promise((resolve, reject) => {
  WowzaAPIWrapper.checkServiceWowzaSingleton()
    .then((wowza) => {
      wowza.getStreamFilesByName(demoDevice.appName, streamfileName)
        .then((result) => { // exist : {StreamFile: {...}} ; not exist : {error: {..., code: 4XX, message}}
          logger.info('[deviceService][getStreamFilesByName]');
          logger.info(result);
          resolve(result);
        })
        .catch((error) => {
          logger.error('[deviceService][getStreamFilesByName][Error]', error);
          console.log(error);
          reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
        });
    })
    .catch((error) => {
      logger.error('[deviceService][getStreamFilesByName][Error]', error);
      console.log(error);
      reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
    });
});

/**
 * check if incoming stream exist
 * @param {string} streamName:  ${device_id}.stream as usual
 * resolve {boolean} true/ false
 */
exports.checkIncomingStreamExist = streamName => new Promise((resolve, reject) => {
  WowzaAPIWrapper.checkServiceWowzaSingleton()
    .then((wowza) => {
      wowza.getStreamInfoByName(demoDevice.appName, streamName)
        .then((result) => { // exist : {isConnected: true, ...} ; not connect : {isConnected: false, ...} ; not exist: { success: false, code: 4XX, ...}
          logger.info('[deviceService][checkIncomingStreamExist]');
          logger.info(result);
          if (result.isConnected === true) resolve(this.STREAM_STATUS.connect);
          else if (!result.isConnected === false) resolve(this.STREAM_STATUS.notConnect); // not connect
          else resolve(this.STREAM_STATUS.notExist); // not exist
        })
        .catch((error) => {
          logger.error('[deviceService][checkIncomingStreamExist][Error]', error);
          console.log(error);
          reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
        });
    })
    .catch((error) => {
      logger.error('[deviceService][checkIncomingStreamExist][Error]', error);
      console.log(error);
      reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
    });
});

/**
 * check if recoder exist
 * @param {string} recorderName:  ${device_id}.stream as usual
 * resolve {boolean} true/ false
 */
exports.checkRecorderExist = recorderName => new Promise((resolve, reject) => {
  WowzaAPIWrapper.checkServiceWowzaSingleton()
    .then((wowza) => {
      wowza.getRecordDetail(demoDevice.appName, recorderName)
        .then((result) => { // recording : {StreamRecorder:{RecorderState: "Recording in Progress", ...}} ; not recording : {StreamRecorder: {RecorderState: "Waiting for stream", ...}}; not exist: { error: {code: 4XX, ...}}
          logger.info('[deviceService][checkRecorderExist]');
          logger.info(result);
          if (has(result, 'StreamRecorder')) {
            if (result.StreamRecorder.RecorderState === 'Recording in Progress') resolve(this.STREAM_STATUS.recording);
            else if (result.StreamRecorder.RecorderState === 'Waiting for stream') resolve(this.STREAM_STATUS.waitForStream); // not recording - wait for stream
          } else resolve(this.STREAM_STATUS.notExist); // not exist
        })
        .catch((error) => {
          logger.error('[deviceService][checkRecorderExist][Error]', error);
          console.log(error);
          reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
        });
    })
    .catch((error) => {
      logger.error('[deviceService][checkRecorderExist][Error]', error);
      console.log(error);
      reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
    });
});

/**
 * get recoder detail
 * @param {string} recorderName:  ${device_id}.stream as usual
 * resolve {object} recoder file info
 */
exports.getRecordDetail = recorderName => new Promise((resolve, reject) => {
  WowzaAPIWrapper.checkServiceWowzaSingleton()
    .then((wowza) => {
      wowza.getRecordDetail(demoDevice.appName, recorderName)
        .then((result) => { // recording : {StreamRecorder:{RecorderState: "Recording in Progress", ...}} ; not recording : {StreamRecorder: {RecorderState: "Waiting for stream", ...}}; not exist: { error: {code: 4XX, ...}}
          logger.info('[deviceService][getRecordDetail]');
          logger.info(result);
          resolve(result);
        })
        .catch((error) => {
          logger.error('[deviceService][getRecordDetail][Error]', error);
          console.log(error);
          reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
        });
    })
    .catch((error) => {
      logger.error('[deviceService][getRecordDetail][Error]', error);
      console.log(error);
      reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
    });
});

/**
 * create stream url by device_ip, device_port and device_id as its streamFileName and connectStreamFile
 * device_id.stream as streamName
 */
exports.createStreamingUrl = params => new Promise((resolve, reject) => {
  const { device_id, device_ip, device_port, device_did, device_password } = params;
  const streamUri = `rtsp://${device_did}:${device_password}@${device_ip}:${device_port}/${demoDevice.videoType1}`;
  const streamfileName = device_id;
  const streamName = `${device_id}.stream`;
  WowzaAPIWrapper.checkServiceWowzaSingleton()
    .then((wowza) => {
      wowza.addStreamFile(demoDevice.appName, streamfileName, streamUri)
        .then((result) => {
          if (result.success === true) return Promise.resolve();
          return Promise.reject('add stream file success: false'); // not success then go error handling
        })
        .then(() => wowza.connectStreamFile(demoDevice.appName, streamfileName))
        .then((result) => {
          if (result.success === true) return Promise.resolve();
          return Promise.reject('connect stream file success: false'); // not success then go error handling
        })
        .then(() => wowza.getPlaybackUrl(demoDevice.appName, streamName))
        .then((playBackUrl) => {
          const returnParams = Object.assign({}, params, { device_streaming_url: playBackUrl });
          logger.info('[deviceService][createStreamingUrl]');
          resolve(returnParams);
        })
        .catch((error) => {
          logger.error('[deviceService][createStreamingUrl][Error]1', error);
          console.log(error);
          reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
        });
    })
    .catch((error) => {
      logger.error('[deviceService][createStreamingUrl][Error]2', error);
      console.log(error);
      reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
    });
});

/**
 * connectStreamFile
 */
exports.connectStreamFile = params => new Promise((resolve, reject) => {
  const { device_id } = params;
  const streamfileName = device_id;
  WowzaAPIWrapper.checkServiceWowzaSingleton()
    .then((wowza) => {
      wowza.connectStreamFile(demoDevice.appName, streamfileName)
        .then((result) => {
          logger.info('[deviceService][connectStreamFile]');
          if (result.success === true) resolve(params);
          else reject({ errorCode: errorCode.STREAM_SERVER_ERROR }); // not success then go error handling
        })
        .catch((error) => {
          logger.error('[deviceService][connectStreamFile][Error]1', error);
          console.log(error);
          reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
        });
    })
    .catch((error) => {
      logger.error('[deviceService][createStreamingUrl][Error]2', error);
      console.log(error);
      reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
    });
});

/**
 * start record wowza streaming in create device and update deivce
 * @param {boolean} updateStream  just pass by update device
 * @param {boolean} updateRecord  just pass by update device
 */
exports.startRecording = params => new Promise((resolve, reject) => {
  const { device_owner, device_id, scenemode_id, updateRecord = true } = params;
  if (updateRecord) {
    logger.info('[deviceService][startRecording]');
    WowzaAPIWrapper.checkServiceWowzaSingleton()
      .then((wowza) => {
        const wowzaConfig = WowzaAPIWrapper.getWowzaRecordConfig();
        wowzaConfig.segmentDuration = 10000;
        wowzaConfig.baseFile = `${device_owner}_${device_id}_${scenemode_id}`;
        wowzaConfig.recordName = device_id;
        wowzaConfig.segmentationType = 'SegmentByDuration';
        const streamName = `${device_id}.stream`;
        // const streamFileName = device_id;
        logger.info(wowzaConfig);
        wowza.startRecording(demoDevice.appName, streamName, wowzaConfig)
          .then((result) => {
            if (result.success === true) resolve(params);
            else reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
          })
          .catch((error) => {
            logger.error('[deviceService][startRecording][ERROR]_1');
            logger.error(JSON.stringify(error));
            console.log(error);
            reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
          });
      })
      .catch((error) => {
        logger.error('[deviceService][startRecording][ERROR]_2');
        logger.error(JSON.stringify(error));
        console.log(error);
        reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
      });
  } else resolve(params);
});

exports.checkDevgroup = params => new Promise((resolve, reject) => {
  const {devgroup_id} = params;
  devGroupDao.checkDevgroup(devgroup_id)
    .then((result) => {
      if (_.isEmpty(result)) reject({ errorCode: errorCode.INVALID_DEVICEGROUP_ID });
      else resolve(params);
    })
    .catch(error => reject(error));
});

exports.listDevgroup = devgroup_id => new Promise((resolve, reject) => {
  deviceDao.listDevgroup(devgroup_id)
    .then((dbResult) => {
      const returnObj = {
        devices: dbResult.slice()
      };
      resolve(returnObj);
    })
    .catch(error => reject(error));
});

exports.deviceInfo = device_id => new Promise((resolve, reject) => {
  deviceDao.getDeviceInfo(device_id)
    .then((dbResult) => {
      if (_.isEmpty(dbResult)) reject({ errorCode: errorCode.INVALID_DEVICE_ID });// return blank object if no data.
      else {
        const dbObj = dbResult.get({
          plain: true
        }); // dbResult.toJSON() /  turn form sequelize obj to normal obj
        const returnResult = Object.assign({}, dbObj); // clone from dbResult
        delete returnResult.deviceAttributes; // no need deviceAttributes
        // const { deviceAttributes, ...returnResult } = dbObj; // clone from dbResult but not need deviceAttributes spread syntax for obj when node version > 8.3
        const device_attribute = [];
        dbObj.deviceAttributes.forEach((attribute) => { // add customos device_attribute
          const attrvalueObj = attribute.deviceAttributeValue;
          device_attribute[attribute.attribute_name] = (attrvalueObj) ? attrvalueObj.attrvalue_value : '';
          const attributePair = {
            name: attribute.attribute_name,
            value: (attrvalueObj) ? attrvalueObj.attrvalue_value : null
          };
          device_attribute.push(attributePair);
        });
        returnResult.device_attribute = device_attribute;
        resolve(returnResult);
      }
    })
    .catch((error) => {
      logger.error('[deviceService][deviceInfo][ERROR]');
      console.log(error);
      reject(error);
    });
});

/**
 * to check if device_id exist and get device_owner used in checkUpdateDevice
 */
exports.getDeviceOwner = device_id => new Promise((resolve, reject) => {
  deviceDao.getDeviceOwner(device_id)
    .then((dbResult) => {
      if (_.isEmpty(dbResult)) reject({ errorCode: errorCode.INVALID_DEVICE_ID });
      else {
        const result = dbResult.get({plain: true});
        (result.device_owner) ? resolve(result.device_owner) : reject({});
      }
    })
    .catch(error => reject(error));
});
/**
 * check if mac ip+port is duplicate with other devices except self
 * @return Promise<params,error>
 */
exports.checkUpdateDevice = (params, device_owner) => new Promise((resolve, reject) => {
  const { device_id, device_name, device_mac, device_ip, device_port} = params;
  deviceDao.checkUpdateDevice(device_id, device_name, device_mac, device_ip, device_port, device_owner)
    .then((result) => {
      if (_.isEmpty(result)) {
        const returnParams = Object.assign({}, params);
        returnParams.device_owner = device_owner; // device owner will be use in updateStream
        resolve(returnParams);
      } else {
        // [{duplicate: "ERRORCODE"}, {duplicate: "ERRORCODE"}, {duplicate: "ERRORCODE"}] to "ERRORCODE1,ERRORCODE2"
        const errorString = _.uniq(result.map(o => o.duplicate)).join();
        // const arr = _.join(_.uniq(_.map(result, o => o.duplicate)));
        reject({ errorCode: errorString });
      }
    }).catch(error => reject(error));
});

/**
 * check if update device attribute item and attribute name is as same as before
 * resolve(params)
 */
exports.checkAttribute = params => new Promise((resolve, reject) => {
  const {device_id, device_attribute} = params;
  deviceDao.getAttributeName(device_id)
    .then((result) => {
      const dbAttr = [];
      result.forEach((obj) => {
        dbAttr.push(obj.attribute_name);
      });
      const putAttr = [];
      device_attribute.forEach((obj) => {
        putAttr.push(obj.name);
      });
      if (putAttr.length !== dbAttr.length) reject({errorCode: errorCode.PARAMETER_LOSE_OR_ERROR});
      const diff = _.intersectionWith(dbAttr, putAttr, _.isEqual); // just list same part
      if (diff.length !== dbAttr.length) reject({errorCode: errorCode.PARAMETER_LOSE_OR_ERROR});
      else resolve(params);
    })
    .catch(error => reject(error));
});

/**
 * get device_ip and device_port and check its necessary to update the wowza stream
 * resolve(params, needUpdate)
 */
exports.needUpdateStreamRecord = params => new Promise((resolve, reject) => {
  const {device_id, device_ip, device_port, device_did, device_password, scenemode_id} = params;
  const returnObj = Object.assign({}, params, { updateStream: false, updateRecord: false });
  deviceDao.getDeviceSetting(device_id)
    .then((dbResult) => {
      const originObj = dbResult.get({plain: true});
      if (device_ip !== originObj.device_ip ||
          device_port !== originObj.device_port ||
          device_did !== originObj.device_did ||
          device_password !== originObj.device_password) {
        returnObj.updateStream = true; // streaming setting same, not need to update stream
      }
      if (scenemode_id !== originObj.scenemode_id) returnObj.updateRecord = true; // updateStream = false
      resolve(returnObj);
    })
    .catch((error) => {
      logger.error('[deviceService][needUpdateStreamRecord][ERROR]');
      console.log(error);
      reject(error);
    });
});

/**
 * @param {boolean} updateStream: true -> updateStream by streamFileName appName and uri
 * @param {boolean} updateStream: false -> do nothing resolve(params);
 */
exports.updateStream = params => new Promise((resolve, reject) => {
  const { device_id, device_ip, device_port, device_did, device_password, updateStream} = params;
  if (updateStream) {
    logger.info('[deviceService][updateStream]');
    WowzaAPIWrapper.checkServiceWowzaSingleton()
      .then((wowza) => {
        const streamUri = `rtsp://${device_did}:${device_password}@${device_ip}:${device_port}/${demoDevice.videoType1}`;
        const streamFileName = device_id;
        const streamName = `${device_id}.stream`;
        wowza.disconnectStream(demoDevice.appName, streamName)
          .then((result) => {
            if (result.success === true) return Promise.resolve();
            return Promise.reject();
          })
          .then(() => wowza.updateStreamFile(demoDevice.appName, streamFileName, streamUri))
          .then((result) => {
            if (result.success === true) return Promise.resolve();
            return Promise.reject();
          })
          .then(() => wowza.connectStreamFile(demoDevice.appName, streamFileName))
          .then((result) => {
            logger.info('[deviceService][updateStream]: update success');
            if (result.success === true) resolve(params);
            else reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
          })
          .catch((error) => {
            logger.error('[deviceService][updateStream][ERROR]');
            console.log(error);
            reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
          });
      })
      .catch((error) => {
        logger.error('[deviceService][updateStream][ERROR]');
        console.log(error);
        reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
      });
  } else resolve(params);
});

/**
 * DB update device
 */
exports.updateDevice = params => new Promise((resolve, reject) => {
  const {device_id} = params;
  deviceDao.updateDevice(params)
    .then((result) => {
      if (result === 'NO ATTRIBUTE' || result.length > 0) resolve({ device_id });
      else reject({});
    })
    .catch((error) => {
      logger.error('[deviceService][updateDevice][ERROR]');
      console.log(error);
      reject(error);
    });
});

/**
 * get device_id, device_streaming_url to delete stream before delete device
 */
exports.getDeviceSetting = device_id => new Promise((resolve, reject) => {
  deviceDao.getDeviceSetting(device_id)
    .then((dbResult) => {
      if (dbResult && dbResult.device_id) {
        const result = dbResult.get({plain: true});
        resolve(result); // turn to palin object from sequelize find
      } else reject({ errorCode: errorCode.INVALID_DEVICE_ID });
    })
    .catch((error) => {
      logger.error('[deviceService][deleteDeviceCheck][ERROR]');
      console.log(error);
      reject(error);
    });
});

/**
 * stop record the stream use in delete device and update device
 * @param {string} device_streaming_url just pass by delete device
 * @param {boolean} updateStream just pass by update device
 * @param {boolean} updateRecord just pass by update device
 */
exports.stopRecording = params => new Promise((resolve, reject) => {
  const { device_id, device_streaming_url, updateRecord} = params;
  if (device_streaming_url || updateRecord) {
    WowzaAPIWrapper.checkServiceWowzaSingleton()
      .then((wowza) => {
        const recorderName = `${device_id}.stream`;
        wowza.stopRecording(demoDevice.appName, recorderName)
          .then((result) => {
            // {success: true, message: 'Recording (ead7c0b0-e179-11e7-b489-773c669e0b41.stream) stopped', data: null}
            if (result.success === true) resolve(params);
            else reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
          })
          .catch((error) => {
            logger.error('[deviceService][stopRecording][ERROR]_1');
            logger.error(JSON.stringify(error));
            console.log(error);
            reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
          });
      })
      .catch((error) => {
        logger.error('[deviceService][stopRecording][ERROR]_2');
        logger.error(JSON.stringify(error));
        console.log(error);
        reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
      });
  } else resolve(params);
});

/**
 * if device_streaming_url exist, disconnect then delete this stream
 */
exports.deleteConnectStreamFile = params => new Promise((resolve, reject) => {
  const { device_id, device_streaming_url} = params;
  if (device_streaming_url) {
    WowzaAPIWrapper.checkServiceWowzaSingleton()
      .then((wowza) => {
        const streamFileName = device_id;
        const streamName = `${device_id}.stream`;
        wowza.disconnectStream(demoDevice.appName, streamName)
          .then((result) => {
            if (result.success === true) return Promise.resolve();
            return Promise.reject();
          })
          .then(() => wowza.deleteStreamFile(demoDevice.appName, streamFileName))
          .then((result) => {
            // success { success: true, message: '', data: null }
            if (result.success === true) resolve(device_id);
            else reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
          })
          .catch((error) => {
            logger.error('[deviceService][deleteConnectStreamFile][ERROR]');
            console.log(error);
            reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
          });
      })
      .catch((error) => {
        logger.error('[deviceService][deleteConnectStreamFile][ERROR]');
        console.log(error);
        reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
      });
  } else resolve(device_id); // has no stream
});

/**
 * if device_streaming_url exist, delete this stream
 */
exports.deleteStreamFile = params => new Promise((resolve, reject) => {
  const { device_id, device_streaming_url } = params;
  if (device_streaming_url) {
    WowzaAPIWrapper.checkServiceWowzaSingleton()
      .then((wowza) => {
        const streamFileName = device_id;
        wowza.deleteStreamFile(demoDevice.appName, streamFileName)
          .then((result) => {
            // success { success: true, message: '', data: null }
            if (result.success === true) resolve(device_id);
            else reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
          })
          .catch((error) => {
            logger.error('[deviceService][deleteStreamFile][ERROR]');
            console.log(error);
            reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
          });
      })
      .catch((error) => {
        logger.error('[deviceService][deleteStreamFile][ERROR]');
        console.log(error);
        reject({ errorCode: errorCode.STREAM_SERVER_ERROR });
      });
  } else resolve(device_id); // has no stream
});

/**
 * delete DB device include its attribute
 */
exports.deleteDevice = device_id => new Promise((resolve, reject) => {
  deviceDao.deleteDevice(device_id)
    .then((dbResult) => {
      if (dbResult === 1) resolve({ device_id });
      else reject({ errorCode: errorCode.INVALID_DEVICE_ID });
    })
    .catch((error) => {
      logger.error('[deviceService][deleteDevice][ERROR]');
      console.log(error);
      reject(error);
    });
});

/**
 * check if device exist
 */
exports.checkDevice = device_id => new Promise((resolve, reject) => {
  deviceDao.checkDevice(device_id)
    .then((result) => {
      if (_.isEmpty(result)) reject({ errorCode: errorCode.INVALID_DEVICE_ID });
      else resolve(device_id);
    })
    .catch(error => reject(error));
});

/**
 * check device and get device_owner
 */
exports.checkDeviceGetOwner = device_id => new Promise((resolve, reject) => {
  deviceDao.checkDeviceGetOwner(device_id)
    .then((result) => {
      if (_.isEmpty(result)) reject({ errorCode: errorCode.INVALID_DEVICE_ID});
      else {
        const {device_owner} = result.get({plain: true});
        resolve(device_owner);
      }
    })
    .catch(error => reject(error));
});

/**
 * analyze data from db result to client
 */
exports.deviceAttributes = device_id => new Promise((resolve, reject) => {
  deviceDao.getDeviceAttributes(device_id)
    .then((dbResult) => {
      if (_.isEmpty(dbResult)) resolve({attributes: []});
      const dbArray = [...dbResult].map((obj) => {
        const rObj = obj.get({
          plain: true
        }); // obj.toJSON();
        delete rObj.deviceAttributeValue;
        return rObj;
      });
      dbResult.forEach((obj, index) => {
        const attrvalueObj = dbResult[index].deviceAttributeValue;
        const attribute_value = (attrvalueObj) ? attrvalueObj.attrvalue_value : '';
        dbArray[index].attribute_value = attribute_value;
      });
      resolve({attributes: dbArray});
    })
    .catch(error => reject(error));
});
