const logger = require('../../../logger');
const RestAPIClient = require('node-rest-client').Client;
const validate = require('./validate');
const errorCode = require('../../../errorCode/errorCode');
const ErrorFormator = require('../../../utils/errorFormator');
const Request = require('request');
const commonService = require('../commonService');

const configInfo = commonService.getConfigInfo();

const WOWZAADDRESS = configInfo.wowza.wowzaAddress;

const API_APPLICATIONS = 'applications';
const API_STREAMFILES = 'streamfiles';
const API_INSTANCES = 'instances';
const API_INCOMINGSTREAMS = 'incomingstreams';

const API_ACTIONS = 'actions';
const API_ACTION_CONNECT = 'connect';
const API_ACTION_DISCONNECTSTREAM = 'disconnectStream';
const API_ACTION_STOPRECORDING = 'stopRecording';
const API_ACTION_SPLITRECORDING = 'splitRecording';

const API_PLAYBACK_TYPE_ADOBE_RTMP = 'Adobe_RTMP';
const API_PLAYBACK_TYPE_ADOBE_HDS = 'Adobe_HDS';
const API_PLAYBACK_TYPE_APPLE_HLS = 'Apple_HLS'; // iOS
const API_PLAYBACK_TYPE_MPEG_DASH = 'MPEG_DASH';
const API_PLAYBACK_TYPE_RTSP = 'RTSP'; // Android
const API_PLAYBACK_TYPE_MICROSOFT_SMOOTH = 'Microsoft_Smooth'; // Silverlight

const MEDIACASTERTYPE_RTP = 'rtp';
const MEDIACASTERTYPE_LIVEREPEATER = 'liverepeater';

const STREAM_RECORDS = 'streamrecorders';
const STREAM_RECORD_CONFIG = { // Refer: https://www.wowza.com/docs/how-to-record-live-streams-wowza-streaming-engine#livestreamrecordhttpprovider
  timeScale: 0,
  instanceName: '',
  fileVersionDelegateName: '',
  serverName: '',
  recorderName: '',
  currentSize: 0,
  segmentSchedule: '', // 按時程：預設 每小時一個文件
  startOnKeyFrame: false, // 開始在遇到的第一個關鍵幀處記錄實時流
  outputPath: '', // 可自己給路徑(但是wowza內要有此路徑)
  currentFile: '',
  saveFieldList: [
    ''
  ],
  recordData: false, // 如果元數據在直播中可用，請將其包含在錄製的文件中
  applicationName: '',
  moveFirstVideoFrameToZero: true,
  recorderErrorString: '',
  segmentSize: 0, // Segment by size. Unit is megabytes and default value is 10 (10 megabytes)
  defaultRecorder: false,
  splitOnTcDiscontinuity: false,
  version: '',
  baseFile: '', // The file name which would save to S3
  segmentDuration: 10000, // Segment by duration. Unit is milliseconds and default is 900000 (15 minutes)
  recordingStartTime: '', // Hours:Minutes:Seconds ,record at when
  fileTemplate: '${BaseFileName}_${SegmentNumber}', // The naming format for record file
  backBufferTime: 0,
  segmentationType: '', // Append to existing file, Version existing file(defualt), Overwrite existing file. Segment by duration: 'SegmentByDuration'
  currentDuration: 0,
  fileFormat: 'MP4', // MP4 (the default value) or FLV
  recorderState: '',
  option: ''
};

let wowzaSingleton = null;

/**
 * @class WowzaAPIWrapper
 * @extends Object
 * @param {Object} [options] possible to set stream parametres which will use as default for methods
 * @param {string} [options.wowzaAddress] IP address or domein name of Wowza Streaming Engine
 * @param {string} [options.appInstance] name of an application instance
 * @param {string} [options.serverName] name of a server
 * @param {string} [options.vhostName] name of a virtual host (VHost)
 * @param {string} [options.mediaCasterType] caster type
 *
 * Refer to wowza API document: http://[wowza_host_ip]:8089/api-docs
 * Manage stream files: https://www.wowza.com/docs/stream-management-query-examples#connectstreamfile
 * RTMP Playback URLs: https://www.wowza.com/docs/how-to-format-adobe-flash-rtmp-urls
 */
class WowzaAPIWrapper {
  constructor(options) {
    this.wowzaAddress = options.wowzaAddress ? options.wowzaAddress : 'localhost';
    this.appInstance = options.appInstance ? options.appInstance : '_definst_';
    this.serverName = options.server ? options.server : '_defaultServer_';
    this.vhostName = options.vhost ? options.vhost : '_defaultVHost_';
    this.mediaCasterType = options.mediaCasterType ? options.mediaCasterType : MEDIACASTERTYPE_LIVEREPEATER;
    this.apiBaseUri = `http://${this.wowzaAddress}:8087/v2/servers/${this.serverName}/vhosts/${this.vhostName}`;
    this.headers = {
      Accept: 'application/json; charset=utf-8',
      'Content-Type': 'application/json; charset=utf-8'
    };
    try {
      this.restAPIClient = new RestAPIClient();
    } catch (error) {
      logger.error(error);
      throw new ErrorFormator(errorCode.STREAM_REST_CLIENT_ERROR);
    }
  }

  static listenEvent(req, reject) {
    req.on('requestTimeout', (request) => {
      logger.error('[wowzaAPIWrapper][listenEvent][Error] request has expired');
      request.abort();
      reject({errorCode: errorCode.STREAM_REQUEST_EXPIRED_ERROR});
    });

    req.on('responseTimeout', () => {
      logger.error('[wowzaAPIWrapper][listenEvent][Error] response has expired');
      reject({errorCode: errorCode.STREAM_RESPONSE_EXPIRED_ERROR});
    });

    req.on('error', () => {
      logger.error('[wowzaAPIWrapper][listenEvent][Error] request has error');
      reject({errorCode: errorCode.STREAM_SERVER_ERROR});
    });
  }

  /**
   * Retrieves the list of stream files for the specified application
   * @param {string} appName The name of specified application
   * @method GET /v2/servers/{serverName}/vhosts/{vhostName}/applications/{appName}/streamfiles
   * @return {Promise} promise object
   */
  getAllStreamFilesByApplication(appName) {
    const promiseObj = new Promise((resolve, reject) => {
      const validateResult = validate.getAllStreamFilesByApplication({appName});
      if (validateResult.error) {
        reject(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
      } else {
        const apiURL = `${this.apiBaseUri}/${API_APPLICATIONS}/${appName}/${API_STREAMFILES}`;
        logger.info(`[wowzaAPIWrapper][getAllStreamFilesByApplication] apiURL = ${apiURL}`);
        try {
          const req = this.restAPIClient.get(apiURL, (data) => {
            resolve(data);
          });
          WowzaAPIWrapper.listenEvent(req, reject);
        } catch (error) {
          logger.error(`[wowzaAPIWrapper][getaAllStreamsByApplication][Error] = ${JSON.stringify(error)}`);
          reject(error);
        }
      }
    });
    return promiseObj;
  }

  /**
   * Retrieves the specified stream file configurationtions
   * @param {string} appName The name of specified application
   * @param {string} streamfileName The name of specified stream file
   * @method GET /v2/servers/{serverName}/vhosts/{vhostName}/applications/{appName}/streamfiles/{streamfileName}
   * @return {Promise} promise object
   */
  getStreamFilesByName(appName, streamfileName) {
    const promiseObj = new Promise((resolve, reject) => {
      const validateResult = validate.getStreamFilesByName({appName, streamfileName});
      if (validateResult.error) {
        reject(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
      } else {
        const apiURL = `${this.apiBaseUri}/${API_APPLICATIONS}/${appName}/${API_STREAMFILES}/${streamfileName}`;
        logger.info(`[wowzaAPIWrapper][getStreamFilesByName] apiURL = ${apiURL}`);
        try {
          const req = this.restAPIClient.get(apiURL, (data) => {
            resolve(data);
          });
          WowzaAPIWrapper.listenEvent(req, reject);
        } catch (error) {
          logger.error(`[wowzaAPIWrapper][getaAllStreamsByApplication][Error] = ${JSON.stringify(error)}`);
          reject(error);
        }
      }
    });
    return promiseObj;
  }

  /**
   * Adds a stream file to the list of stream file for the specified application
   * @param {string} appName The name of specified application
   * @param {string} streamfileName The name of created stream file
   * @param {string} uri The uri of device straemming. The format is "DeviceIP:Port/Channel"
   * @method POST /v2/servers/{serverName}/vhosts/{vhostName}/applications/{appName}/streamfiles
   * @return {Promise} promise object
   */
  addStreamFile(appName, streamfileName, uri) {
    const promiseObj = new Promise((resolve, reject) => {
      const validateResult = validate.addStreamFile({appName, streamfileName, uri});
      if (validateResult.error) {
        reject(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
      } else {
        const apiURL = `${this.apiBaseUri}/${API_APPLICATIONS}/${appName}/${API_STREAMFILES}`;
        const args = {
          data: {uri, name: streamfileName},
          headers: this.headers
        };
        logger.info(`[wowzaAPIWrapper][addStreamFile] apiURL = ${apiURL}, args = `, args);
        try {
          const req = this.restAPIClient.post(apiURL, args, (data) => {
            resolve(data);
          });
          WowzaAPIWrapper.listenEvent(req, reject);
        } catch (error) {
          logger.error(`[wowzaAPIWrapper][addStreamFile][Error] = ${JSON.stringify(error)}`);
          reject(error);
        }
      }
    });
    return promiseObj;
  }

  /**
   * Updates the specified stream file configuration
   * @param {string} appName The name of specified application
   * @param {string} streamfileName The name of created stream file
   * @method PUT /v2/servers/{serverName}/vhosts/{vhostName}/applications/{appName}/streamfiles/{streamfileName}
   * @return {Promise} promise object
   * Notice: the name in body cannot change streamFileName
   */
  updateStreamFile(appName, streamfileName, uri) {
    return new Promise((resolve, reject) => {
      const validateResult = validate.updateDeleteStreamFile({ appName, streamfileName });
      if (validateResult.error) {
        reject(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
      }
      const apiURL = `${this.apiBaseUri}/${API_APPLICATIONS}/${appName}/${API_STREAMFILES}/${streamfileName}`;
      const args = {
        data: {uri},
        headers: this.headers
      };
      logger.info(`[wowzaAPIWrapper][updateStreamFile] apiURL = ${apiURL}, args = `, args);
      try {
        const req = this.restAPIClient.put(apiURL, args, (data) => {
          resolve(data);
        });
        WowzaAPIWrapper.listenEvent(req, reject);
      } catch (error) {
        logger.error(`[wowzaAPIWrapper][updateStreamFile][Error] = ${JSON.stringify(error)}`);
        reject(error);
      }
    });
  }

  /**
   * Deletes the specified stream file configuration
   * @param {string} appName The name of specified application
   * @param {string} streamfileName The name of created stream file
   * @method DELETE /v2/servers/{serverName}/vhosts/{vhostName}/applications/{appName}/streamfiles/{streamfileName}
   * @return {Promise} promise object
   */
  deleteStreamFile(appName, streamfileName) {
    const promiseObj = new Promise((resolve, reject) => {
      const validateResult = validate.updateDeleteStreamFile({appName, streamfileName});
      if (validateResult.error) {
        reject(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
      } else {
        const apiURL = `${this.apiBaseUri}/${API_APPLICATIONS}/${appName}/${API_STREAMFILES}/${streamfileName}`;
        const args = {headers: this.headers};
        logger.info(`[wowzaAPIWrapper][deleteStreamFile] apiURL = ${apiURL}, args = `, args);
        try {
          const req = this.restAPIClient.delete(apiURL, args, (data) => {
            resolve(data);
          });
          WowzaAPIWrapper.listenEvent(req, reject);
        } catch (error) {
          logger.error(`[wowzaAPIWrapper][deleteStreamFile][Error] = ${JSON.stringify(error)}`);
          reject(error);
        }
      }
    });
    return promiseObj;
  }

  /**
   * Connect a existing streamfile
   * @param {string} appName The name of specified application
   * @param {string} streamfileName The name of created stream file
   * @param {string} mediaCasterType Caster type. Default value is 'liverepeater'
   * @param {string} appInstance The name of app insrance. Default value is '_definst_'
   * @method PUT /v2/servers/{serverName}/vhosts/{vhostName}/smilfiles/{smilfileName}/actions/{action}
   * @return {Promise} promise object
   */
  connectStreamFile(appName, streamfileName, mediaCasterType = this.mediaCasterType, appInstance = this.appInstance) {
    const promiseObj = new Promise((resolve, reject) => {
      const validateResult = validate.connectStreamFile({appName, streamfileName, mediaCasterType, appInstance});
      if (validateResult.error) {
        reject(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
      } else {
        const apiURL = `${this.apiBaseUri}/${API_STREAMFILES}/${streamfileName}/${API_ACTIONS}/${API_ACTION_CONNECT}`;
        const args = {
          parameters: {connectAppName: appName, appInstance, mediaCasterType},
          headers: this.headers
        };
        logger.info(`[wowzaAPIWrapper][connectStreamFile] apiURL = ${apiURL}, args = `, args);
        try {
          const req = this.restAPIClient.put(apiURL, args, (data) => {
            resolve(data);
          });
          WowzaAPIWrapper.listenEvent(req, reject);
        } catch (error) {
          logger.error(`[wowzaAPIWrapper][connectStreamFile][Error] = ${JSON.stringify(error)}`);
          reject(error);
        }
      }
    });
    return promiseObj;
  }

  /**
   * Disconnect a existing stream
   * @param {string} appName The name of specified application
   * @param {string} streamName The name of created stream
   * @param {string} appInstance The name of app insrance. Default value is '_definst_'
   * @method PUT /v2/servers/{serverName}/vhosts/{vhostName}/applications/{appName}/instances/{instanceName}/incomingstreams/{streamName}/actions/{action}
   * @return {Promise} promise object
   */
  disconnectStream(appName, streamName, appInstance = this.appInstance) {
    const promiseObj = new Promise((resolve, reject) => {
      const validateResult = validate.disconnectStreamFile({appName, streamName, appInstance});
      if (validateResult.error) {
        reject(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
      } else {
        const apiURL = `${this.apiBaseUri}/${API_APPLICATIONS}/${appName}/${API_INSTANCES}/${appInstance}/${API_INCOMINGSTREAMS}/${streamName}/${API_ACTIONS}/${API_ACTION_DISCONNECTSTREAM}`;
        const args = {headers: this.headers};
        logger.info(`[wowzaAPIWrapper][disconnectStreamFile] apiURL = ${apiURL}, args = `, args);
        try {
          const req = this.restAPIClient.put(apiURL, args, (data) => {
            resolve(data);
          });
          WowzaAPIWrapper.listenEvent(req, reject);
        } catch (error) {
          logger.error(`[wowzaAPIWrapper][disconnectStreamFile][Error] = ${JSON.stringify(error)}`);
          reject(error);
        }
      }
    });
    return promiseObj;
  }

  /**
   * Retrieves the Incoming Stream information for the specifed Incoming Stream
   * @param {string} appName The name of specified application
   * @param {string} streamName The name of created stream
   * @param {string} appInstance The name of app insrance. Default value is '_definst_'
   * @method GET /v2/servers/{serverName}/vhosts/{vhostName}/applications/{appName}/instances/{instanceName}/incomingstreams/{streamName}
   * @return {Promise} promise object
   */
  getStreamInfoByName(appName, streamName, appInstance = this.appInstance) {
    const promiseObj = new Promise((resolve, reject) => {
      const validateResult = validate.getStreamInfoByName({appName, streamName, appInstance});
      if (validateResult.error) {
        reject(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
      } else {
        const apiURL = `${this.apiBaseUri}/${API_APPLICATIONS}/${appName}/${API_INSTANCES}/${appInstance}/${API_INCOMINGSTREAMS}/${streamName}`;
        const args = {headers: this.headers};
        logger.info(`[wowzaAPIWrapper][getStreamInfoByName] apiURL = ${apiURL}, args = `, args);
        try {
          const req = this.restAPIClient.get(apiURL, args, (data) => {
            resolve(data);
            // If the value of property: isConnected is false, it means that this incoming stream has 0 Bytes In
          });
          WowzaAPIWrapper.listenEvent(req, reject);
        } catch (error) {
          logger.error(`[wowzaAPIWrapper][getStreamInfoByName][Error] = ${JSON.stringify(error)}`);
          reject(error);
        }
      }
    });
    return promiseObj;
  }
  /**
   * According to the type of playback client to provide playback url.
   * @param {string} appName The name of specified application
   * @param {string} streamName The name of created stream
   * @param {string} playbackType The type of playback client. Default value is API_PLAYBACK_TYPE_RTSP
   * @return {Promise} promise object
   * Refer to https://www.wowza.com/community/questions/5359/rtmp-url-format.html
   */
  getPlaybackUrl(appName, streamName, playbackType = API_PLAYBACK_TYPE_RTSP) {
    const promiseObj = new Promise((resolve, reject) => {
      const playbackTypeLists = [API_PLAYBACK_TYPE_ADOBE_RTMP, API_PLAYBACK_TYPE_ADOBE_HDS, API_PLAYBACK_TYPE_APPLE_HLS, API_PLAYBACK_TYPE_MPEG_DASH, API_PLAYBACK_TYPE_RTSP, API_PLAYBACK_TYPE_MICROSOFT_SMOOTH];
      const validateResult = validate.getPlaybackUrl({appName, streamName, playbackType}, playbackTypeLists);
      if (validateResult.error) {
        reject(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
      } else {
        let playbackUrl;
        switch (playbackType) {
          case API_PLAYBACK_TYPE_ADOBE_RTMP:
            playbackUrl = `rtmp://${this.wowzaAddress}:1935/${appName}/${streamName}`;
            break;
          case API_PLAYBACK_TYPE_ADOBE_HDS:
            playbackUrl = `http://${this.wowzaAddress}:1935/${appName}/${streamName}/manifest.f4m`;
            break;
          case API_PLAYBACK_TYPE_APPLE_HLS:
            playbackUrl = `http://${this.wowzaAddress}:1935/${appName}/${streamName}/playlist.m3u8`;
            break;
          case API_PLAYBACK_TYPE_MPEG_DASH:
            playbackUrl = `http://${this.wowzaAddress}:1935/${appName}/${streamName}/manifest.mpd`;
            break;
          case API_PLAYBACK_TYPE_RTSP:
            playbackUrl = `rtsp://${this.wowzaAddress}:1935/${appName}/${streamName}`;
            break;
          case API_PLAYBACK_TYPE_MICROSOFT_SMOOTH:
            playbackUrl = `http://${this.wowzaAddress}:1935/${appName}/${streamName}/Manifest`;
            break;
          default:
            reject('');
        }
        resolve(playbackUrl);
      }
    });
    return promiseObj;
  }

  /**
   * Creates a new Stream Recorder and starts recording
   * @param {String} appName
   * @param {String} streamName The name of created stream
   * @param {String} appInstance
   * @return {Promise} promise object
   * @method POST /v2/servers/{serverName}/vhosts/{vhostName}/applications/{appName}/instances/{instanceName}/streamrecorders/{recorderName}
   * @param {Object} recorderParametres must be STREAM_RECORD_CONFIG object
   * @param {string} recorderParametres.restURI
   * @param {string} recorderParametres.recorderName
   * @param {string} recorderParametres.instanceName
   * @param {string} recorderParametres.recorderState
   * @param {boolean} recorderParametres.defaultRecorder
   * @param {string} recorderParametres.segmentationType, Segment by duration: 'SegmentByDuration'
   * @param {string} recorderParametres.outputPath  default value is [] and wowza should save files in [install-dir]/content
   * @param {string} recorderParametres.baseFile  default is [], and wowza should name file as a streamfile name. It would be saved to S3.
   * @param {string} recorderParametres.fileFormat FLV or MP4
   * @param {string} recorderParametres.fileVersionDelegateName
   * @param {string} recorderParametres.fileTemplate filename template string
   * @param {number} recorderParametres.segmentDuration [milliseconds] default is 900000 (15 minutes)
   * @param {number} recorderParametres.segmentSize [megabytes] default value is 10 (10 megabytes)
   * @param {string} recorderParametres.segmentSchedule
   * @param {boolean} recorderParametres.recordData
   * @param {boolean} recorderParametres.startOnKeyFrame
   * @param {boolean} recorderParametres.splitOnTcDiscontinuity
   * @param {number} recorderParametres.backBufferTime
   * @param {string} recorderParametres.option
   * @param {boolean} recorderParametres.moveFirstVideoFrameToZero
   * @param {number} recorderParametres.currentSize
   * @param {number} recorderParametres.currentDuration
   * @param {string} recorderParametres.recordingStartTime sting format is in Hours:Minutes:Seconds, record at when
   */
  startRecording(appName, streamName, recorderParametres = STREAM_RECORD_CONFIG, appInstance = this.appInstance) {
    const promiseObj = new Promise((resolve, reject) => {
      const params = Object.assign({}, {appName, streamName, appInstance}, recorderParametres);
      const validateResult = validate.startRecording(params);
      if (validateResult.error) {
        reject(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
      } else {
        const apiURL = `${this.apiBaseUri}/${API_APPLICATIONS}/${appName}/${API_INSTANCES}/${appInstance}/${STREAM_RECORDS}/${streamName}`;
        const args = {
          data: recorderParametres,
          headers: this.headers
        };

        logger.info(`[wowzaAPIWrapper][startRecording] apiURL = ${apiURL}, args = `, args);
        try {
          const req = this.restAPIClient.post(apiURL, args, (result) => {
            if (result.error) {
              reject(result.error);
            } else {
              resolve(result);
            }
          });
          WowzaAPIWrapper.listenEvent(req, reject);
        } catch (error) {
          logger.error(`[wowzaAPIWrapper][startRecording][Error] = ${JSON.stringify(error)}`);
          reject(error);
        }
      }
    });
    return promiseObj;
  }

  /**
   * Stop a existing Stream Recorder
   * @param {String} appName
   * @param {String} recorderName
   * @param {String} action : API_ACTION_STOPRECORDING or API_ACTION_SPLITRECORDING
   * @param {String} appInstance
   * @return {Promise} promise object
   * @method PUT /v2/servers/{serverName}/vhosts/{vhostName}/applications/{appName}/instances/{instanceName}/streamrecorders/{recorderName}/actions/{action}
   */
  stopRecording(appName, recorderName, action = API_ACTION_STOPRECORDING, appInstance = this.appInstance) {
    const promiseObj = new Promise((resolve, reject) => {
      const recordActionLists = [API_ACTION_STOPRECORDING, API_ACTION_SPLITRECORDING];
      const validateResult = validate.stopRecording({appName, recorderName, action, appInstance}, recordActionLists);
      if (validateResult.error) {
        reject(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
      } else {
        const apiURL = `${this.apiBaseUri}/${API_APPLICATIONS}/${appName}/${API_INSTANCES}/${appInstance}/${STREAM_RECORDS}/${recorderName}/${API_ACTIONS}/${action}`;
        const args = {
          headers: this.headers
        };
        logger.info(`[wowzaAPIWrapper][stopRecording] apiURL = ${apiURL}, args = `, args);
        try {
          const req = this.restAPIClient.put(apiURL, args, (result) => {
            logger.info(`[wowzaAPIWrapper][stopRecording] result = ${result}`);
            console.log(result);
            if (result.error) {
              reject(result.error);
            } else {
              resolve(result);
            }
          });
          WowzaAPIWrapper.listenEvent(req, reject);
        } catch (error) {
          logger.error(`[wowzaAPIWrapper][stopRecording][Error] = ${JSON.stringify(error)}`);
          reject(error);
        }
      }
    });
    return promiseObj;
  }

  /**
   * Retrieves the specifed Stream Recorder
   * @param {String} appName
   * @param {String} recorderName
   * @param {String} appInstance
   * @return {Promise} promise object
   * @method GET /v2/servers/{serverName}/vhosts/{vhostName}/applications/{appName}/instances/{instanceName}/streamrecorders/{recorderName}
   */
  getRecordDetail(appName, recorderName, appInstance = this.appInstance) {
    const promiseObj = new Promise((resolve, reject) => {
      const validateResult = validate.getRecordingInfo({appName, recorderName, appInstance});
      if (validateResult.error) {
        reject(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
      } else {
        const apiURL = `${this.apiBaseUri}/${API_APPLICATIONS}/${appName}/${API_INSTANCES}/${appInstance}/${STREAM_RECORDS}/${recorderName}`;
        logger.info(`[wowzaAPIWrapper][getRecordDetail] apiURL = ${apiURL}`);
        try {
          const req = this.restAPIClient.get(apiURL, (result) => {
            logger.info(`[wowzaAPIWrapper][getRecordDetail] result = ${result}`);
            resolve(result);
          });
          WowzaAPIWrapper.listenEvent(req, reject);
        } catch (error) {
          logger.error(`[wowzaAPIWrapper][getRecordDetail][Error] = ${JSON.stringify(error)}`);
          reject(error);
        }
      }
    });
    return promiseObj;
  }

  /**
   * Check if wowza service is alive
   * @return {Promise} promise object
   */
  checkServiceIsAlive() {
    const promiseObj = new Promise((resolve, reject) => {
      const apiURL = `http://${this.wowzaAddress}/8087`;
      logger.info(`[wowzaAPIWrapper][checkServiceIsAlive] apiURL = ${apiURL}`);
      try {
        const req = this.restAPIClient.get(apiURL, (result) => {
          logger.info(`[wowzaAPIWrapper][checkServiceIsAlive] result = ${result}`);
          console.log(result);
          resolve(result);
        });
        WowzaAPIWrapper.listenEvent(req, reject);
      } catch (error) {
        logger.error(`[wowzaAPIWrapper][checkServiceIsAlive][Error]: ${JSON.stringify(error)}`);
        console.log(error);
        reject(error);
      }
    });
    return promiseObj;
  }

  checkServiceAlive() {
    return new Promise((resolve, reject) => {
      const apiURL = `http://${this.wowzaAddress}/8087`;
      Request
        .get(apiURL)
        .on('response', () => {
          logger.info('[wowzaAPIWrapper][checkServiceAlive]: Alive');
          resolve();
        })
        .on('error', (error) => {
          logger.error('[wowzaAPIWrapper][checkServiceAlive][Error]', error);
          reject(error);
        });
    });
  }
}

const getWowzaSingleton = (options) => {
  if (!wowzaSingleton) {
    const wowzaOptions = options ? options.wowzaAddress : { wowzaAddress: WOWZAADDRESS, mediaCasterType: MEDIACASTERTYPE_RTP };
    try {
      wowzaSingleton = new WowzaAPIWrapper(wowzaOptions);
    } catch (error) {
      logger.error('[wowzaAPIWrapper][getWowzaSingleton][Error] new a WowzaAPIWrapper failed');
      wowzaSingleton = null;
      throw error;
    }
  }
  return wowzaSingleton;
};

const checkServiceWowzaSingleton = options => new Promise((resolve, reject) => {
  const conditionalChain = () => {
    if (!wowzaSingleton) {
      const wowzaOptions = options ? options.wowzaAddress : { wowzaAddress: WOWZAADDRESS, mediaCasterType: MEDIACASTERTYPE_RTP };
      try {
        logger.info('[wowzaAPIWrapper][checkServiceWowzaSingleton]: new wowzaSingleton');
        wowzaSingleton = new WowzaAPIWrapper(wowzaOptions);
        return wowzaSingleton.checkServiceAlive();
      } catch (error) {
        logger.error('[wowzaAPIWrapper][checkServiceWowzaSingleton][Error]: new a WowzaAPIWrapper failed');
        wowzaSingleton = null;
        return Promise.reject(error);
      }
    } else {
      logger.info('[wowzaAPIWrapper][checkServiceWowzaSingleton]: has wowzaSingleton');
      return Promise.resolve();
    }
  };
  conditionalChain()
    .then(() => resolve(wowzaSingleton))
    .catch((error) => {
      logger.error('[wowzaAPIWrapper][checkServiceWowzaSingleton][Error]');
      logger.error(error);
      console.log(error);
      reject(error);
    });
});

const getWowzaRecordConfig = () => Object.assign({}, STREAM_RECORD_CONFIG);

module.exports = { getWowzaSingleton, getWowzaRecordConfig, checkServiceWowzaSingleton};
