/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const sceneDatalandMark = sequelize.define('sceneDatalandMark', {
    datalandmark_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    markbmode_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'markBelongMode',
        key: 'markbmode_id'
      }
    },
    scedp_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    scenevideo_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    device_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'device',
        key: 'device_id'
      }
    },
    notifibuser_id: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    track_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'sceneDatalandMark'
  });
  sceneDatalandMark.associate = (models) => {
    sceneDatalandMark.hasOne(models.markBelongMode, {
      foreignKey: 'markbmode_id'
    }, { onDelete: 'cascade' }, { onUpdate: 'cascade' });
    sceneDatalandMark.hasOne(models.device, {
      foreignKey: 'device_id'
    }, { onDelete: 'cascade' }, { onUpdate: 'cascade' });
  };
  return sceneDatalandMark;
};
