const deviceService = require('../../services/device/deviceService');
const commonService = require('../../services/common/commonService');
const ResFormator = require('../../utils/formator');
const errorCode = require('../../errorCode/errorCode');
const logger = require('../../logger');
const validate = require('./validate');
const has = require('has');
const _ = require('lodash');

const configInfo = commonService.getConfigInfo();
const demoDevice = configInfo.wowza.demoDevice;

const deviceErrorHandleDeleteStream = params => new Promise((resolve, reject) => {
  const {device_id} = params;
  const streamfileName = device_id;
  const streamName = `${device_id}.stream`;
  const recorderName = `${device_id}.stream`;
  logger.warn('[deviceController][deviceErrorHandleDeleteStream]');
  deviceService.checkRecorderExist(recorderName)
    .then((result) => { // Notice: some time after add stream and connect stream and recording, it will not be recording as soon, it will display "Waiting for stream"
      if (result !== deviceService.STREAM_STATUS.notExist) return deviceService.stopRecording(params);
      return Promise.resolve();
    })
    .then(() => deviceService.checkIncomingStreamExist(streamName))
    .then((result) => {
      if (result === deviceService.STREAM_STATUS.connect) return deviceService.deleteConnectStreamFile(params);
      return deviceService.checkStreamFileExist(streamfileName);
    })
    .then((result) => { // Notice: some time after add stream and connect stream, it will not be connect as soon, it will display is not connect status, so maybe it will stay connect streamfile only, but not has any match stream file in stream list
      if (result === deviceService.STREAM_STATUS.exist) return deviceService.deleteStreamFile(params);
      return Promise.resolve();
    })
    .then(() => {
      logger.info('at the end of deviceErrorHandle');
      resolve();
    })
    .catch((error) => {
      logger.error('[deviceController][deviceErrorHandleDeleteStream][ERROR]');
      logger.error(error);
      console.log(error);
      reject(error);
    });
});

const deviceErrorHandleAddStream = params => new Promise((resolve, reject) => {
  const { device_id } = params;
  const streamfileName = device_id;
  const streamName = `${device_id}.stream`;
  const recorderName = `${device_id}.stream`;
  logger.warn('[deviceController][deviceErrorHandleAddStream]');
  deviceService.checkStreamFileExist(streamfileName)
    .then((result) => {
      if (result === deviceService.STREAM_STATUS.notExist) return deviceService.createStreamingUrl(params); // do both add stream and connect stream
      return deviceService.checkIncomingStreamExist(streamName);
    })
    .then((result) => {
      if (result === deviceService.STREAM_STATUS.notExist) return deviceService.connectStreamFile(params); // connect streamFile only
      return Promise.resolve();
    })
    .then(() => deviceService.checkRecorderExist(recorderName))
    .then((result) => {
      if (result === deviceService.STREAM_STATUS.notExist) return deviceService.startRecording(params); // recording streamFile
      return Promise.resolve();
    })
    .then(() => {
      logger.info('at the end of deviceErrorHandle');
      resolve();
    })
    .catch((error) => {
      logger.error('[deviceController][deviceErrorHandleAddStream][ERROR]');
      logger.error(error);
      console.log(error);
      reject(error);
    });
});

const rollBackStreamContent = (originParams, updateParams) => new Promise((resolve, reject) => {
  deviceErrorHandleDeleteStream(updateParams)
    .then(() => deviceErrorHandleAddStream(originParams))
    .then(() => {
      logger.info('[deviceController][rollBackStream]');
      resolve();
    })
    .catch((error) => {
      logger.error('[deviceController][rollBackStream][ERROR]');
      logger.error(error);
      console.log(error);
      reject(error);
    });
});

const reRecording = (originParams, updateParams) => new Promise((resolve, reject) => {
  logger.info('[deviceController][reRecording]');
  const recorderName = `${originParams.device_id}.stream`;
  const updateObj = Object.assign({}, updateParams, {updateRecord: true});
  deviceService.getRecordDetail(recorderName)
    .then((result) => {
      console.log(result);
      if (has(result, 'StreamRecorder')) {
        if (result.StreamRecorder.BaseFile.includes(`${originParams.device_owner}_${originParams.device_id}_${originParams.scenemode_id}.`)) {
          logger.warn('do nothing');
          return Promise.resolve({noNeedStop: true}); // do nothing
        }
        logger.warn('stopRecording');
        return deviceService.stopRecording(updateObj); // scenemode_id change that need stopRecording
      }
      logger.warn('has no streamRecorder do nothing');
      return Promise.resolve({});
    })
    .then((o) => {
      logger.info('[deviceController][reRecording] after if else promise statement');
      logger.info(o);
      console.log(o);
      if (!has(o, 'noNeedStop')) return deviceService.startRecording(originParams);
      return Promise.resolve();
    })
    .then(() => resolve())
    .catch((error) => {
      logger.error('[deviceController][reRecording][Error]');
      logger.error(error);
      console.log(error);
      reject(error);
    });
});

const updateDeviceErrorHandle = (originParams, updateParams) => new Promise((resolve, reject) => {
  const {device_id} = originParams;
  const streamfileName = device_id;
  let streamUri = '';
  const originUri = `rtsp://${originParams.device_did}:${originParams.device_password}@${originParams.device_ip}:${originParams.device_port}/${demoDevice.videoType1}`;
  // const streamUri = `rtsp://${device_did}:${device_password}@${device_ip}:${device_port}/${demoDevice.videoType1}`;
  deviceService.getStreamFilesByName(streamfileName)
    .then((result) => {
      logger.info('[updateDeviceErrorHandle]');
      logger.info(result);
      if (has(result, 'StreamFile')) {
        streamUri = result.StreamFile.URI;
        logger.warn(streamUri);
        logger.warn(originUri);
        if (streamUri === originUri && originParams.scenemode_id === updateParams.scenemode_id) return Promise.resolve(); // do nothing
        else if (streamUri === originUri && originParams.scenemode_id !== updateParams.scenemode_id) return reRecording(originParams, updateParams);// re recording
        return rollBackStreamContent(originParams, updateParams); // disconnect recording
      } return deviceErrorHandleAddStream(originParams);
    })
    .then(() => {
      logger.info('[deviceController][updateDeviceErrorHandle]');
      resolve();
    })
    .catch((error) => {
      logger.error('[deviceController][updateDeviceErrorHandle][ERROR]');
      logger.error(error);
      console.log(error);
      reject(error);
    });
});

/**
 * Add Device to DeviceGroup
 * request {device_id, devgroup_id}
 * response {devbgroup_id}
 */
exports.addDeviceDevgroup = (req, res, next) => {
  const params = req.params;
  deviceService.checkDeviceDevgroup(params)
    .then(deviceService.addDeviceDevgroup)
    .then((result) => {
      logger.info('[deviceController][addDeviceDevgroup]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => { // error custom object: { errorCode(string type) , error(obj type)
      logger.error('[deviceController][addDeviceDevgroup][ERROR]:', error);
      console.log(error);
      req.ctrlResult = new ResFormator();
      if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
      next();
    });
};
/**
 * Share Device to other account
 * request {device_id, account_id}
 * response {accountsharedev_id}
 */
exports.shareDevice = (req, res, next) => {
  const params = req.params;
  deviceService.checkShareDevice(params)
    .then(deviceService.shareDevice)
    .then((result) => {
      logger.info('[deviceController][shareDevice]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error('[deviceController][shareDevice][ERROR]:', error);
      req.ctrlResult = new ResFormator();
      if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
      next();
    });
};
/**
 * Share Devices (array) to other account
 * request {devices:[device_id, ..]}
 * response {}
 */
exports.shareDevices = (req, res, next) => {
  const params = Object.assign({}, req.params, req.body);
  const validateResult = validate.shareDevices(params);
  if (validateResult.error) {
    const resFormator = new ResFormator();
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
    return;
  }
  deviceService.checkShareDevices(params)
    .then(deviceService.checkShareDeviceToSelf)
    .then(deviceService.checkDuplicateShareDevices)
    .then(deviceService.shareDevices)
    .then((result) => {
      logger.info('[deviceController][shareDevices]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error('[deviceController][shareDevices][ERROR]:');
      logger.error(error);
      req.ctrlResult = new ResFormator();
      if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
      next();
    });
};

/**
 * delete the view auth Device to the other account
 * request {device_id, account_id}
 * response {accountsharedev_id}
 */
exports.deleteShareDevice = (req, res, next) => {
  const params = req.params;
  deviceService.checkShareDevice(params)
    .then(deviceService.deleteShareDevice)
    .then((result) => {
      logger.info('[deviceController][deleteShareDevice]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error('[deviceController][deleteShareDevice][ERROR]:');
      logger.error(error);
      req.ctrlResult = new ResFormator();
      if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
      next();
    });
};
/**
 * first use ip and port to stream a wowza url and create a new device and its device attributes
 * request {device_name, device_ip, device_owner, device_attribute, scenemode_id, device_port,
 * device_zone, device_mac, device_did, device_password}
 * response {device_id}
 */
exports.createDevice = (req, res, next) => {
  const params = Object.assign({}, req.body);
  const validateResult = validate.createDevice(params);
  if (validateResult.error) {
    const resFormator = new ResFormator();
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
    return;
  }
  const device_id = commonService.generateUUIDByTimestamp();
  params.device_id = device_id; // add device_id to params
  deviceService.checkCreateDevice(params)
    .then(deviceService.createStreamingUrl) // stream wowza and return stream url
    .then(deviceService.startRecording)
    .then(deviceService.createDevice)
    .then((result) => {
      logger.info('[deviceController][createDevice]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error('[deviceController][createDevice][ERROR]:');
      logger.error(JSON.stringify(error));
      const passFakeStreamingUrlforCheck = Object.assign({}, params, { device_streaming_url: 'forAddingUse'});
      deviceErrorHandleDeleteStream(passFakeStreamingUrlforCheck)
        .then(() => {})
        .catch(() => {})
        .then(() => {
          req.ctrlResult = new ResFormator();
          logger.warn('[deviceController][createDevice][ERROR_HANDLE]');
          if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
          next();
        });
    });
};
/**
 * list the device and its device_streaming_url
 * request {devgroup_id}
 * response {devices: [{ device_id, device_streaming_url}]}
 */
exports.listDevgroup = (req, res, next) => {
  const params = req.params;
  deviceService.checkDevgroup(params)
    .then(() => deviceService.listDevgroup(params.devgroup_id))
    .then((result) => {
      logger.info('[deviceController][listDevgroup]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error('[deviceController][listDeviceGroup][ERROR]:');
      logger.error(error);
      console.log(error);
      req.ctrlResult = new ResFormator();
      if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
      next();
    });
};
/**
 * get the info of device
 * request {device_id}
 * response {device_id, device_name, device_ip, device_attribute, scenemode_id, device_port,
 * device_zone, device_mac, device_did, device_password}
 */
exports.getDeviceInfo = (req, res, next) => {
  const { device_id } = req.params;
  deviceService.deviceInfo(device_id)
    .then((result) => {
      logger.info('[deviceController][getDeviceInfo]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error(`[deviceController][getDeviceInfo][ERROR]: ${JSON.stringify(error)}`);
      req.ctrlResult = new ResFormator();
      if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
      next();
    });
};
/**
 * put device info and its attribute
 */
exports.updateDevice = (req, res, next) => {
  const params = req.body;
  const {device_id} = params;
  let updateParams = {};
  const validateResult = validate.updateDevice(params);
  if (validateResult.error) {
    const resFormator = new ResFormator();
    resFormator.errorCode = errorCode.ARGUMENTS_ERROR(validateResult.errorKeys);
    req.ctrlResult = resFormator;
    next();
    return;
  }
  deviceService.checkDeviceGetOwner(device_id)
    .then((device_owner) => {
      updateParams = Object.assign({}, params, {device_owner});
      return deviceService.checkUpdateDevice(params, device_owner);
    })
    .then(deviceService.checkAttribute)
    .then(deviceService.needUpdateStreamRecord) // add needUpdate key at params
    .then(deviceService.stopRecording) // scenemode_id change that need stopRecording
    .then(deviceService.updateStream)
    .then(deviceService.startRecording)
    .then(deviceService.updateDevice)
    .then((result) => {
      logger.info('[deviceController][updateDevice]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error('[deviceController][updateDevice][Error]');
      logger.error(error);
      console.log(error);
      const conditionalChain = () => {
        if (_.isEmpty(updateParams)) return Promise.resolve();
        return deviceService.getDeviceSetting(device_id);
      };
      conditionalChain()
        .then((originParams) => {
          if (_.isEmpty(originParams)) return Promise.resolve();
          // { device_streaming_url: 'forAddingUse' } add in updateParams
          updateParams.device_streaming_url = 'forAddingUse';
          return updateDeviceErrorHandle(originParams, updateParams);
        })
        .then(() => {})
        .catch(() => {})
        .then(() => {
          req.ctrlResult = new ResFormator();
          logger.warn('[deviceController][updateDevice][ERROR_HANDLE]');
          if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
          next();
        });
    });
};
/**
 * delete the device and its device attribute
 * request {device_id}
 * response {device_id}
 */
exports.deleteDevice = (req, res, next) => {
  const { device_id } = req.params;
  let deviceInfo = {};
  deviceService.getDeviceSetting(device_id)
    .then((result) => {
      deviceInfo = Object.assign({}, result);
      return deviceService.stopRecording(result);
    })
    .then(deviceService.deleteConnectStreamFile)
    .then(deviceService.deleteDevice)
    .then((result) => {
      logger.info('[deviceController][deleteDevice]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error('[deviceController][deleteDevice][Error]');
      logger.error(error);
      console.log(error);
      const conditionalChain = () => {
        if (_.isEmpty(deviceInfo)) return Promise.resolve();
        return deviceErrorHandleAddStream(deviceInfo);
      };
      conditionalChain()
        .then(() => {})
        .catch(() => {})
        .then(() => {
          req.ctrlResult = new ResFormator();
          logger.warn('[deviceController][deleteDevice][ERROR_HANDLE]');
          if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
          next();
        });
    });
};
/**
 * get the attributes of device
 * request {device_id}
 * response attributes: [{attribute_id, attribute_name, attribute_value, attribute_status, attribute_sequence}, {}]
 */
exports.getAttributes = (req, res, next) => {
  const { device_id } = req.params; // check device_id first
  deviceService.checkDevice(device_id)
    .then(deviceService.deviceAttributes)
    .then((result) => {
      logger.info('[deviceController][getAttributes]:', result);
      req.ctrlResult = new ResFormator(result);
      next();
    })
    .catch((error) => {
      logger.error('[deviceController][getAttributes][ERROR]:', error);
      req.ctrlResult = new ResFormator();
      if (error.errorCode) req.ctrlResult.errorCode = error.errorCode;
      next();
    });
};
