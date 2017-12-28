/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const deviceGroup = sequelize.define('deviceGroup', {
    devgroup_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    devgroup_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    devgroup_owner: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'account',
        key: 'account_id'
      }
    },
    devgroup_sequence: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    devgroup_status: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '1'
    },
    devgroup_created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    devgroup_updated_time: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'deviceGroup'
  });
  deviceGroup.associate = (models) => {
    deviceGroup.belongsTo(models.account, {
      foreignKey: 'devgroup_owner'
    });
    deviceGroup.hasMany(models.deviceBelongGroup, {
      foreignKey: 'devgroup_id'
    }, { onDelete: 'cascade' }, { onUpdate: 'cascade' });
  };
  return deviceGroup;
};
