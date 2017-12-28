/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const markBelongMode = sequelize.define('markBelongMode', {
    markbmode_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    scenemode_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'sceneMode',
        key: 'scenemode_id'
      }
    },
    scenemark_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'sceneMark',
        key: 'scenemark_id'
      }
    }
  }, {
    tableName: 'markBelongMode'
  });
  markBelongMode.associate = (models) => {
    markBelongMode.belongsTo(models.sceneDatalandMark, {
      foreignKey: 'markbmode_id'
    });
  };
  return markBelongMode;
};
