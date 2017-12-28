const errorCode = require('../../errorCode/errorCode');
const retentionDao = require('./retentionDao');
const accountDao = require('../account/accountDao');
const logger = require('../../logger');
const orderDao = require('./orderDao');
const moment = require('moment');
const ErrorFormator = require('../../utils/errorFormator');

exports.getRetentionsInfo = () => new Promise((resolve, reject) => {
  retentionDao.getRetentionsInfo()
    .then((result) => {
      const retentionsObject = { retentions: result }; // array save to object
      logger.info('[retentionService][getRetentionsInfo]');
      resolve(retentionsObject);
    }).catch((error) => {
      logger.error('[retentionService][getRetentionsInfo][Error]:', error);
      reject(error);
    });
});

exports.checkRetentionId = params => new Promise((resolve, reject) => {
  retentionDao.checkRetentionId(params.reten_id)
    .then((searchRetenid) => {
      if (searchRetenid === 0) reject({ errorCode: errorCode.INVALID_RETENTION_ID }); // reten_id not exist
      else resolve(params);
    })
    .catch((error) => {
      logger.error('[retentionService][checkRetentionId][ERROR]:', error);
      reject(error);
    });
});

exports.checkAccount = params => new Promise((resolve, reject) => {
  accountDao.checkAccount(params.account_id)
    .then((searchAccountid) => {
      if (!searchAccountid) reject({ errorCode: errorCode.INVALID_ACCOUNT_ID }); // reten_id not exist
      else resolve(params);
    })
    .catch((error) => {
      logger.error('[retentionService][createOrderInfo][ERROR]:', error);
      reject(error);
    });
});

exports.checkRetenNameIsExisted = params => new Promise((resolve, reject) => {
  retentionDao.checkRetenNameIsExisted(params.reten_id, params.order_name)
    .then((checkOrderName) => {
      if (checkOrderName === 0) reject({ errorCode: errorCode.INVALID_RETENTION_NAME }); // reten_id not exist
      else resolve(params);
    })
    .catch((error) => {
      logger.error('[retentionService][checkRetenNameIsExisted][ERROR]:', error);
      reject(error);
    });
});

exports.checkAlreadyBuy = params => new Promise((resolve, reject) => {
  orderDao.checkAlreadyBuy(params.account_id, params.reten_id)
    .then((checkAlreadyBuy) => {
      if (checkAlreadyBuy !== null) reject({ errorCode: errorCode.ORDER_ALREADYBUY_ERROR }); // reten_id not exist
      else resolve(params);
    })
    .catch((error) => {
      logger.error('[retentionService][checkAlreadyBuy][ERROR]:', error);
      reject(error);
    });
});

exports.findRetetiondaysByRetentionid = params => new Promise((resolve, reject) => {
  retentionDao.findRetetiondaysByRetentionid(params.reten_id)
    .then((result) => {
      const data = result.toJSON();
      const order_days = { order_days: data.reten_days };
      const value = Object.assign(params, order_days);
      return orderDao.createOrder(value); // create order  
    })
    .then((value) => {
      resolve({
        order_status: value.order_status,
        order_id: value.order_id
      });
      logger.info('[retentionService][findRetetiondaysByRetentionid]');
    })
    .catch((error) => {
      logger.error('[retentionService][findRetetiondaysByRetentionid][ERROR]:', error);
      reject(error);
    });
});

exports.checkOrderId = params => new Promise((resolve, reject) => {
  orderDao.checkOrderId(params.order_id)
    .then((checkOrderId) => {
      if (!checkOrderId) reject({errorCode: errorCode.INVALID_ORDER_ID}); // order_id not exist
      else resolve(params);
    })
    .catch((error) => {
      logger.error('[retentionService][updateOrderInfo][ERROR]:', error);
      reject(error);
    });
});

exports.updateOrderInfo = params => new Promise((resolve, reject) => {
  orderDao.updateOrder(params)
    .then(() => {
      logger.info('[retentionService][updateOrderInfo]:', params.order_status, params.order_id);
      resolve({
        order_status: params.order_status,
        order_id: params.order_id
      });
    })
    .catch((error) => {
      logger.error('[retentionService][updateOrder][ERROR]:', error);
      reject(error);
    });
});

exports.checkOrderAccountId = params => new Promise((resolve, reject) => {
  orderDao.checkOrderAccountId(params)
    .then((checkOrderAccountId) => {
      if (checkOrderAccountId === null) reject({errorCode: errorCode.INVALID_ACCOUNT_ID}); // order_id not exist
      else resolve(params);
    })
    .catch((error) => {
      logger.error('[retentionService][getOrderInfoByAccount][ERROR]:', error);
      reject(error);
    });
});

exports.accountOrderInfo = params => new Promise((resolve, reject) => {
  orderDao.accountOrderInfo(params)
    .then((orders) => {
      logger.info('[retentionService][getOrderInfoByAccount]:');
      resolve({
        orders
      });
    })
    .catch((error) => {
      logger.error('[retentionService][getOrderInfoByAccount][ERROR]:', error);
      reject(error);
    });
});

exports.getOrderInfo = params => new Promise((resolve, reject) => {
  orderDao.checkOrderName(params)
    .then((value) => {
      if (value === null) reject({errorCode: errorCode.INVALID_ORDER_ID }); // order_id not exist
      else {
        const orders = value.toJSON();
        orders.order_created_time = moment(value.order_created_time).unix(Number);
        logger.info('[retentionService][getOrderInfo]:', orders);
        resolve(
          orders
        );
      }

    })
    .catch((error) => {
      logger.error('[retentionService][getOrderInfo][ERROR]:', error);
      reject(error);
    });
});
