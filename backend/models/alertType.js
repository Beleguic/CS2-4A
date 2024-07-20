const { Model, DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  class AlertType extends Model {}

  AlertType.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  }, {
    sequelize,
    modelName: 'AlertType',
    tableName: 'alert_types',
    timestamps: false,
  });

  return AlertType;
};
