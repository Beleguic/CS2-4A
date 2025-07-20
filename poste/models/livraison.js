const { Model, DataTypes } = require('sequelize');
const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

module.exports = function (sequelize) {
  class Livraison extends Model {
    static async generateString() {
        console.log('Generating delivery number');
        const prefix = 'FR';
        const year = new Date().getFullYear();
        const client = new Client({
            connectionString: process.env.DATABASE_URL_POSTE,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    
        try {
            await client.connect();
    
            // Trouver le dernier enregistrement et obtenir le numéro de manière sécurisée
            const res = await client.query(
                'SELECT MAX(CAST(SUBSTRING(livraison FROM \'\\d+$\') AS INTEGER)) AS last_number FROM "Livraisons" WHERE livraison LIKE $1',
                [`${prefix}-${year}-%`]
            );
            
            const lastNumber = res.rows[0].last_number || 0;
            const number = lastNumber + 1;
    
            // Générer 3 lettres aléatoires de manière sécurisée
            const letters = this.generateRandomLetters(3);
    
            // Créer la chaîne
            const generatedString = `${prefix}-${year}-${number.toString().padStart(6, '0')}-${letters}`;
    
            console.log('Generated delivery number:', generatedString);
            return generatedString;
        } catch (error) {
            console.error("Erreur lors de la génération du numéro de livraison:", error);
            // Fallback: utiliser un timestamp + random
            const timestamp = Date.now().toString(36);
            const random = crypto.randomBytes(3).toString('hex').toUpperCase();
            return `${prefix}-${year}-${timestamp}-${random}`;
        } finally {
            try {
                await client.end();
            } catch (endError) {
                console.error("Erreur lors de la fermeture de la connexion:", endError);
            }
        }
    }
    
    // Fonction pour générer des lettres aléatoires de manière sécurisée
    static generateRandomLetters(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        
        // Utiliser crypto.randomBytes pour une génération plus sécurisée
        const randomBytes = crypto.randomBytes(length);
        
        for (let i = 0; i < length; i++) {
            const randomIndex = randomBytes[i] % characters.length;
            result += characters.charAt(randomIndex);
        }
        
        return result;
    }

    // Méthode pour valider les données de livraison
    static validateLivraisonData(data) {
        const errors = [];
        
        // Validation de l'expéditeur
        if (!data.expediteur) {
            errors.push('Les données de l\'expéditeur sont requises');
        } else {
            const expediteur = data.expediteur;
            if (!expediteur.nom_entreprise || expediteur.nom_entreprise.trim().length === 0) {
                errors.push('Le nom de l\'entreprise expéditrice est requis');
            }
            if (!expediteur.adresse || expediteur.adresse.trim().length === 0) {
                errors.push('L\'adresse de l\'expéditeur est requise');
            }
            if (!expediteur.code_postal || !/^\d{5}$/.test(expediteur.code_postal)) {
                errors.push('Le code postal de l\'expéditeur doit contenir 5 chiffres');
            }
            if (!expediteur.ville || expediteur.ville.trim().length === 0) {
                errors.push('La ville de l\'expéditeur est requise');
            }
            if (!expediteur.pays || expediteur.pays.trim().length === 0) {
                errors.push('Le pays de l\'expéditeur est requis');
            }
        }
        
        // Validation du destinataire
        if (!data.destinataire) {
            errors.push('Les données du destinataire sont requises');
        } else {
            const destinataire = data.destinataire;
            if (!destinataire.nom || destinataire.nom.trim().length === 0) {
                errors.push('Le nom du destinataire est requis');
            }
            if (!destinataire.prenom || destinataire.prenom.trim().length === 0) {
                errors.push('Le prénom du destinataire est requis');
            }
            if (!destinataire.adresse || destinataire.adresse.trim().length === 0) {
                errors.push('L\'adresse du destinataire est requise');
            }
            if (!destinataire.code_postale || !/^\d{5}$/.test(destinataire.code_postale)) {
                errors.push('Le code postal du destinataire doit contenir 5 chiffres');
            }
            if (!destinataire.ville || destinataire.ville.trim().length === 0) {
                errors.push('La ville du destinataire est requise');
            }
            if (!destinataire.telephone || !/^(\+33|0)[1-9](\d{8})$/.test(destinataire.telephone)) {
                errors.push('Le numéro de téléphone du destinataire est invalide');
            }
        }
        
        return errors;
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
      unique: true,
      validate: {
        notEmpty: true,
        len: [10, 20] // Longueur minimale et maximale
      }
    },
    expediteur: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true,
        isValidExpediteur(value) {
          if (!value || typeof value !== 'object') {
            throw new Error('Les données de l\'expéditeur sont invalides');
          }
          const requiredFields = ['nom_entreprise', 'adresse', 'code_postal', 'ville', 'pays'];
          for (const field of requiredFields) {
            if (!value[field] || typeof value[field] !== 'string' || value[field].trim().length === 0) {
              throw new Error(`Le champ '${field}' de l'expéditeur est requis`);
            }
          }
        }
      }
    },
    destinataire: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          notEmpty: true,
          isValidDestinataire(value) {
            if (!value || typeof value !== 'object') {
              throw new Error('Les données du destinataire sont invalides');
            }
            const requiredFields = ['nom', 'prenom', 'adresse', 'ville', 'code_postale', 'telephone'];
            for (const field of requiredFields) {
              if (!value[field] || typeof value[field] !== 'string' || value[field].trim().length === 0) {
                throw new Error(`Le champ '${field}' du destinataire est requis`);
              }
            }
            // Validation du téléphone
            if (!/^(\+33|0)[1-9](\d{8})$/.test(value.telephone)) {
              throw new Error('Le numéro de téléphone du destinataire est invalide');
            }
            // Validation du code postal
            if (!/^\d{5}$/.test(value.code_postale)) {
              throw new Error('Le code postal du destinataire doit contenir 5 chiffres');
            }
          }
        }
    },
    status: {
        type: DataTypes.ENUM('En attente', 'En cours', 'Livré', 'Annulé', 'Retourné'),
        allowNull: false,
        defaultValue: 'En attente',
        validate: {
          isIn: [['En attente', 'En cours', 'Livré', 'Annulé', 'Retourné']]
        }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Livraison',
    tableName: 'Livraisons',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['livraison']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Hook avant validation pour générer le numéro de livraison
  Livraison.addHook('beforeValidate', async (livraison, options) => {
    if (!livraison.livraison) {
      livraison.livraison = await Livraison.generateString();
    }
  });

  // Hook avant sauvegarde pour mettre à jour updated_at
  Livraison.addHook('beforeSave', async (livraison, options) => {
    livraison.updated_at = new Date();
  });

  // Hook après création pour logging
  Livraison.addHook('afterCreate', async (livraison, options) => {
    console.log(`Nouvelle livraison créée: ${livraison.livraison}`);
  });

  return Livraison;
};
