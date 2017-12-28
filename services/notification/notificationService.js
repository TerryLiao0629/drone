const _ = require('lodash');
const logger = require('../../logger');
const errorCode = require('../../errorCode/errorCode');
const noticeDao = require('../../services/notification/noticeDao');
const commonService = require('../../services/common/commonService');
const AWS = require('aws-sdk');
const JPush = require('jpush-sdk');

const sns = new AWS.SNS({
  region: 'ap-northeast-1',
  apiVersion: '2010-03-31'
});

const IOS_ApplicationArn = 'arn:aws:sns:ap-northeast-1:099913625225:app/APNS/appleProduction';
const ANDROID_ApplicationArn = 'arn:aws:sns:ap-northeast-1:099913625225:app/GCM/NICE_FCM_Test2';

// TODO: ENV aws config needs accessKeyId, secretAccessKey, region
const JPUSH_APP_KEY = '';
const JPUSH_MASTER_SECRET = '';

/**
 * check datalandmark_id and device_id
 */
exports.checkIds = params => new Promise((resolve, reject) => {
  logger.info('[notificationService][checkIds]');
  noticeDao.checkIds(params)
    .then((result) => {
      logger.info('[notificationService][checkIds]result:', result);
      if (_.isEmpty(result)) {
        reject({ errorCode: errorCode.INVALID_DATALANDMARK_ID });
      } else if (result[0].isAccountId === 0) {
        reject({ errorCode: errorCode.INVALID_ACCOUNT_ID });
      } else if (result[0].accountStatus === 0) {
        reject({ errorCode: errorCode.INVALID_ACCOUNT_STATUS_DISABLE });
      } else if (result[0].device_id !== params.device_id) {
        reject({ errorCode: errorCode.INVALID_DEVICE_ID });
      } else {
        resolve(params);
      }
    })
    .catch((error) => {
      reject(error);
    });
});

exports.getSendMessageInfos = params => new Promise((resolve, reject) => {
  logger.info('[notificationService][getSendMessageInfo]');
  const {message, account_id, notification_type, device_id, datalandmark_id} = params;
  noticeDao.getSendMessageInfos(params)
    .then((Infos) => {
      if (_.isEmpty(Infos)) {
        reject({ errorCode: errorCode.INVALID_PLATFORM_RECORD });
      } else {
        const notificationTriggers = [];
        Infos.map((Info) => {
          const {platform_token, platform_type} = Info;
          const triggertoaccount_id = Info.account_id;
          const notificationtrigger_id = commonService.generateUUIDByRandom();
          const notificationTrigger = {notificationtrigger_id,
            notificationtrigger_message: message,
            account_id,
            notificationtriggertoaccount_id: triggertoaccount_id,
            notificationtrigger_type: notification_type,
            device_id,
            datalandmark_id };

          Object.assign(notificationTrigger, {platform_token, platform_type});
          return notificationTriggers.push(notificationTrigger);
        });
        logger.info('[notificationService][getSendMessageInfos]notificationTriggers:', notificationTriggers);
        resolve(notificationTriggers);
      }
    })
    .catch((error) => {
      reject(error);
    });
});

const makePayload = (params) => {
  const {deviceType, message} = params;
  logger.info('[makePayload] deviceType:', deviceType, ' message:', message);
  let payload = {};
  if (deviceType === 1) { // ANDROID
    payload = {
      GCM: {data: {message}}
    };
    payload.GCM = JSON.stringify(payload.GCM);
    payload = JSON.stringify(payload);
  } else if (deviceType === 2) { // IOS
    payload = {
      APNS: {aps: {alert: message}}
    };
    payload.APNS = JSON.stringify(payload.APNS);
    payload = JSON.stringify(payload);
  } else {
    // ('no support deviceType');
  }
  return payload;
};

const insertNotificationTrigger = (notificationTrigger, isError) => {
  if (isError) {
    // default notificationtrigger_status: 1
    Object.assign(notificationTrigger, {notificationtrigger_status: 0});
  }
  logger.info('[notificationService][createPlatformEndpoint]');
  noticeDao.create(notificationTrigger)
    .then(() => {
      logger.info('[commonService][insertNotificationTrigger] success');
    }).catch((error) => {
      logger.error('[commonService][insertNotificationTrigger] error:', error);
    });
};

/**
 * push notification and insert notificationTrigger
 * @param {String} Token device token
 * @param {String} deviceType device type IOS or ANDROID
 * @param {String} message notification message
 * @return {Json Object} EndpointArn of device
 */
const pushNotification = (params, notificationTrigger) => new Promise((resolve) => {
  logger.info('[commonService][createPlatformEndpoint] params:', params);
  const {Token, deviceType} = params;

  let PlatformApplicationArn = '';
  if (deviceType === 1) { // ANDROID
    PlatformApplicationArn = ANDROID_ApplicationArn;
  } else if (deviceType === 2) { // IOS
    PlatformApplicationArn = IOS_ApplicationArn;
  }

  sns.createPlatformEndpoint({PlatformApplicationArn, Token}, (err, data) => {
    if (err) {
      logger.error('[commonService][pushNotification][createPlatformEndpoint] err:', err);
      insertNotificationTrigger(notificationTrigger, true);
      logger.info('[commonService][pushNotification][resolve]');
      resolve({statusCode: err.statusCode, message: err.message});
    } else {
      const endpointArn = data.EndpointArn;
      const payload = makePayload(params);

      const APNSMessage = {
        Message: payload,
        MessageStructure: 'json',
        TargetArn: endpointArn
      };

      logger.info('[commonService][sendAPNS] APNSMessage');
      sns.publish(APNSMessage, (error) => {
        if (error) {
          logger.error('[commonService][sendAPNS] error:', error);
          insertNotificationTrigger(notificationTrigger, true);
          resolve({statusCode: err.statusCode, message: err.message});
        } else {
          logger.info('[commonService][sendAPNS] success');
          insertNotificationTrigger(notificationTrigger, false);
          resolve({});
        }
      }); // sns.publish
    } // else
  }); // sns.createPlatformEndpoint
});

const jpushForAndroid = (params, notificationTrigger) => new Promise((resolve) => {
  logger.info('[commonService][jpushForAndroid]params:', params);
  const {regId, message} = params;
  // TODO write your 極光開發者 key and master secret
  const client = JPush.buildClient(JPUSH_APP_KEY, JPUSH_MASTER_SECRET);
  client.push().setPlatform('android')
    .setAudience(JPush.registration_id(regId))
    .setNotification(JPush.android(message, 'NICE PUSH', 1))
    .send((err, res) => {
      if (err) {
        logger.error('[commonService][jpushForAndroid] error:', err.message);
        insertNotificationTrigger(notificationTrigger, true);
        resolve({statusCode: err.httpCode, message: err.name});
      } else {
        logger.info('[commonService][jpushForAndroid] success:', res);
        insertNotificationTrigger(notificationTrigger, false);
        resolve({});
      }
    });
});

/**
 * after pushNotification, insert History to notificationTrigger
 */
exports.sendMessageAndHistory = (notificationTriggers) => {
  const promises = [];
  const notificationtrigger_type = notificationTriggers[0].notificationtrigger_type;
  logger.info('[notificationService][sendMessage]notification_type:', notificationtrigger_type);

  switch (notificationtrigger_type) {
    case 'email':
      break;
    case 'sms':
      break;
    case 'platform': {
      notificationTriggers.map((notificationTrigger) => {
        const {platform_token, platform_type, notificationtrigger_message} = notificationTrigger;
        const pushData = {Token: platform_token, deviceType: platform_type, message: notificationtrigger_message};
        return promises.push(pushNotification(pushData, notificationTrigger));
      });
      break;
    }
    case 'jpush': {
      notificationTriggers.map((notificationTrigger) => {
        const {platform_token, notificationtrigger_message} = notificationTrigger;
        const pushData = {regId: platform_token, message: notificationtrigger_message};
        return promises.push(jpushForAndroid(pushData, notificationTrigger));
      });
      break;
    }
    default:
      break;
  }

  return Promise.all(promises)
    .then((results) => {
      logger.info('[notificationService][sendMessage]success:', results);
      return new Promise((resolve, reject) => {
        results.forEach((result) => {
          if (!_.isEmpty(result)) {
            reject({ errorCode: errorCode.NOTIFICATION_SERVER_ERROR });
          }
        });
        resolve({});
      });
    })
    .catch((error) => {
      logger.error('[notificationService][sendMessage]error', error);
      return Promise.reject(error);
    });
};
