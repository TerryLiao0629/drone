
module.exports = (sequelize, DataTypes) => {
  const platform = sequelize.define('platform', {
    platform_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    app_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'app',
        key: 'app_id'
      }
    },
    account_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'account',
        key: 'account_id'
      }
    },
    platform_token: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    platform_type: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    platform_created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    platform_updated_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'platform'
  });
  platform.associate = (models) => {
    platform.belongsTo(models.app, {
      foreignKey: 'app_id'
    });
    platform.belongsTo(models.account, {
      foreignKey: 'account_id'
    });
  };
  return platform;
};
