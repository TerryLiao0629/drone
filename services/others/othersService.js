const logger = require('../../logger');
const accounTakeLogDao = require('./accounTakeLogDao');
const sceneDatalandMarkDao = require('./sceneDatalandMarkDao');
const sceneDataVideoDao = require('./sceneDataVideoDao');
const sceneDataPhotoDao = require('./sceneDataPhotoDao');
const errorCode = require('../../errorCode/errorCode');

exports.createActions = params => new Promise((resolve, reject) => {
  logger.info('[others][createActions]');
  accounTakeLogDao.create(params)
    .then((result) => {
      const resultJson = result.toJSON();
      logger.info('[others][createActions][result]:', resultJson);
      if (resultJson !== null) {
        resolve(resultJson);
      } else {
        reject({ errorCode: errorCode.INTERNAL_ERROR });
      }
    })
    .catch((error) => {
      reject(error);
    });
});

exports.checkDataLanMarkId = params => new Promise((resolve, reject) => {
  logger.info('[others][checkDataLanMarkId]:', params);
  sceneDatalandMarkDao.findOneBySceneDatalandMarkId(params.datalandmark_id)
    .then((result) => {
      const resultJson = result.toJSON();
      logger.info('[others][checkDataLanMarkId][result]:', resultJson);
      if (resultJson !== null) {
        resolve(resultJson);
      } else {
        reject({ errorCode: errorCode.INVALID_DATALANDMARK_ID });
      }
    })
    .catch((error) => {
      reject(error);
    });
});

exports.restoreVideoRecord = params => new Promise((resolve, reject) => {
  const {scenevideo_id} = params;
  logger.info('[others][restoreVideoRecord][scenevideo_id]:', scenevideo_id);
  if (scenevideo_id) {
    const updataValues = {scenevideo_deleted: 0, scenevideo_deleted_time: null};
    sceneDataVideoDao.updateById(scenevideo_id, updataValues)
      .then((result) => {
        if (result) {
          resolve(params);
        } else {
          reject({ errorCode: errorCode.INTERNAL_ERROR });
        }
      })
      .catch((error) => {
        reject(error);
      });
  } else {
    resolve(params);
  }
});

exports.restorePhotoRecord = params => new Promise((resolve, reject) => {
  const {scedp_id} = params;
  logger.info('[others][restorePhotoRecord][scedp_id]:', scedp_id);
  if (scedp_id) {
    const updataValues = {scedp_deleted: 0, scedp_deleted_time: null};
    sceneDataPhotoDao.updateById(scedp_id, updataValues)
      .then((result) => {
        if (result) {
          resolve(params);
        } else {
          reject({ errorCode: errorCode.INTERNAL_ERROR });
        }
      })
      .catch((error) => {
        reject(error);
      });
  } else {
    resolve(params);
  }
});
