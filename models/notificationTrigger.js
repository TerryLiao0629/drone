
module.exports = (sequelize, DataTypes) => {
  const notificationTrigger = sequelize.define('notificationTrigger', {
    notificationtrigger_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    notificationtrigger_message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    account_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    notificationtriggertoaccount_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    notificationtrigger_type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    notificationtrigger_status: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1
    },
    device_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    datalandmark_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    notificationtrigger_created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'notificationTrigger'
  });
  return notificationTrigger;
};
