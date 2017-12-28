/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const accountShareDeviceGroup = sequelize.define('accountShareDeviceGroup', {
    accountsharedevgroup_id: {
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
    devgroup_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'deviceGroup',
        key: 'devgroup_id'
      }
    }
  }, {
    tableName: 'accountShareDeviceGroup'
  });
  accountShareDeviceGroup.associate = (models) => {
    accountShareDeviceGroup.belongsTo(models.deviceGroup, {
      foreignKey: 'devgroup_id'
    });
    accountShareDeviceGroup.belongsTo(models.account, {
      foreignKey: 'account_id'
    });
  };
  return accountShareDeviceGroup;
};
