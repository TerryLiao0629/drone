const order = require('../../models').order;

exports.createOrder = (params) => {
  const sql = order.create(params);
  return sql;
};

exports.updateOrder = (params) => {
  const { order_id } = params;
  const updateInfo = {
    order_status: params.order_status,
    order_address: params.order_address,
  };
  const sql = order.update(updateInfo, {
    attributes: ['order_status', 'order_address'],
    where: { order_id },
  });
  return sql;
};

exports.getAccountInfo = account_id => order.findAll({
  attributes: ['order_id', 'order_amount', 'order_paymethod', 'order_status', 'reten_id'],
  where: {
    account_id
  },
});

/*
 * checker if value exist
 */

exports.checkAlreadyBuy = (account_id, reten_id) => order.find({
  attributes: ['account_id', 'reten_id'],
  where: {
    account_id,
    reten_id
  },
});

exports.checkOrderId = order_id => order.find({
  attributes: ['order_id'],
  where: {
    order_id
  }
});

exports.checkOrderAccountId = account_id => order.find({
  attributes: ['order_id'],
  where: {
    account_id
  }
});

exports.accountOrderInfo = account_id => order.findAll({
  attributes: ['order_id', 'order_name', 'order_amount', 'order_paymethod', 'order_status'],
  where: {
    account_id
  }
});

exports.checkOrderId = order_id => order.find({
  attributes: ['order_id'],
  where: {
    order_id
  }
});

exports.checkOrderName = order_id => order.find({
  attributes: ['order_name', 'order_amount', 'order_tax', 'order_days', 'order_address', 'order_status', 'order_paymethod', 'order_created_time'],
  where: {
    order_id
  }
});
