const { Model, DataTypes, Sequelize } = require('sequelize');

module.exports = function (sequelize) {
  class AlertType extends Model {}

  AlertType.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
