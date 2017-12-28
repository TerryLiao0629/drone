
module.exports = (sequelize, DataTypes) => {
  const accounTakeLog = sequelize.define('accounTakeLog', {
    accountakelog_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    account_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    datalandmark_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    accountakelog_type: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    accountakelog_started_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    accountakelog_ended_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    accountakelog_created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'accounTakeLog'
  });
  return accounTakeLog;
};
