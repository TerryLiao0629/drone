/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const deviceBelongGroup = sequelize.define('deviceBelongGroup', {
    devbgroup_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    devgroup_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'deviceGroup',
        key: 'devgroup_id'
      }
    },
    device_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'device',
        key: 'device_id'
      }
    },
    device_sequence: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
  }, {
    tableName: 'deviceBelongGroup'
  });
  deviceBelongGroup.associate = (models) => {
    deviceBelongGroup.belongsTo(models.deviceGroup, {
      foreignKey: 'devgroup_id'
    });
    deviceBelongGroup.belongsTo(models.device, {
      foreignKey: 'device_id'
    });
  };
  return deviceBelongGroup;
};
