const { Model, DataTypes } = require('sequelize');
const { Client } = require('pg');
require('dotenv').config();

module.exports = function (sequelize) {
  class Livraison extends Model {
    static async generateString() {
        console.log('Generating string');
        const prefix = 'FR';
        const year = new Date().getFullYear();
        const client = new Client({connectionString: process.env.DATABASE_URL_POSTE});
    
        try {
            await client.connect();
    
            // Trouver le dernier enregistrement et obtenir le numéro
            const res = await client.query('SELECT MAX(livraison) AS last_number from "Livraisons";');
            const lastNumber = res.rows[0].last_number;
            const number = lastNumber !== null ? parseInt(lastNumber.split('-')[2]) + 1 : 1;
    
            // Générer 3 lettres aléatoires
            const letters = this.generateRandomLetters(3);
    
            // Créer la chaîne
            const generatedString = `${prefix}-${year}-${number}-${letters}`;
    
            console.log(generatedString);
            return generatedString;
        } catch (error) {
            console.error("-------------------------------------------------------------");
            console.error(error);

        } finally {
            await client.end();
            
        }

    }
    
    // Fonction pour générer des lettres aléatoires
    static generateRandomLetters(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
  }

  Livraison.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    livraison: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expediteur: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    destinataire: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'En attente',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Livraison',
    tableName: 'Livraisons',
    timestamps: false,
  });

  Livraison.addHook('beforeValidate', async (livraison, options) => {
    if (!livraison.livraison) {
      livraison.livraison = await Livraison.generateString();
    }
  });

  return Livraison;
};
