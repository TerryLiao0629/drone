/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
  const retentions = sequelize.define('retentions', {
    reten_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    reten_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    reten_cost: {
      type: DataTypes.INTEGER(6),
      allowNull: false
    },
    reten_days: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    reten_status: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '1'
    },
    reten_sequence: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    reten_created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    reten_updated_time: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'retentions'
  });
  retentions.associate = (models) => {
    retentions.hasMany(models.order, {
      foreignKey: 'reten_id'
    }, { onDelete: 'cascade' }, { onUpdate: 'cascade' });
  };
  return retentions;
};
