const { Model, DataTypes } = require('sequelize');
const sequelize = require('./db.js');  // Assurez-vous que le chemin est correct pour l'importation de votre instance sequelize.

class Category extends Model { }

Category.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    url: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    sequelize,
    modelName: 'Category',
    tableName: 'category',
    timestamps: true
});

module.exports = Category;