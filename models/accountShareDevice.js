/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const accountShareDevice = sequelize.define('accountShareDevice', {
    accountsharedev_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    account_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'account',
        key: 'account_id'
      }
    },
    device_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'device',
        key: 'device_id'
      }
    }
  }, {
    tableName: 'accountShareDevice'
  });
  accountShareDevice.associate = (models) => {
    accountShareDevice.belongsTo(models.device, {
      foreignKey: 'device_id'
    });
    accountShareDevice.belongsTo(models.account, {
      foreignKey: 'account_id'
    });
  };
  return accountShareDevice;
};
