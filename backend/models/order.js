const { Model, DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  class Order extends Model {}

  Order.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    products: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    tva: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    isPayed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    livraison: {
      type: DataTypes.STRING,
        allowNull: false,
    },
    adresseFacturation: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: false,
  });

  Order.associate = function(models) {
    Order.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Order;
};
