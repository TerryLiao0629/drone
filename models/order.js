/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const order = sequelize.define('order', {
    order_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    account_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    reten_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    order_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    order_amount: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    order_tax: {
      type: DataTypes.INTEGER(3),
      allowNull: false
    },
    order_days: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    order_address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    order_status: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    },
    order_paymethod: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1
    },
    order_created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    order_updated_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'order'
  });
  order.associate = (models) => {
    order.belongsTo(models.retentions, {
      foreignKey: 'reten_id'
    });
    order.belongsTo(models.account, {
      foreignKey: 'account_id'
    });
  };
  return order;
};
