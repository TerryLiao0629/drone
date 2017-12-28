/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const sceneDataVideo = sequelize.define('sceneDataVideo', {
    scenevideo_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    scenevideo_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    scenevideo_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    small_thumbnail_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    large_thumbnail_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    scenevideo_deleted: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    scenevideo_status: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '1'
    },
    scenevideo_sequence: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    scenevideo_deleted_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    scenevideo_created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    scenevideo_expired_time: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'sceneDataVideo'
  });
  return sceneDataVideo;
};
