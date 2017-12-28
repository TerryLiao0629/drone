/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const sceneDataPhoto = sequelize.define('sceneDataPhoto', {
    scedp_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    scedp_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    scedp_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    scedp_deleted: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    scedp_status: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '1'
    },
    scedp_sequence: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    scedp_deleted_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    scedp_created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'sceneDataPhoto'
  });
  return sceneDataPhoto;
};
