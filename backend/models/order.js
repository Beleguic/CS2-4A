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
    stripe_session_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    stripe_payment_intent_id: {
        type: DataTypes.STRING,
        allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Order.associate = function(models) {
    Order.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Order;
};
