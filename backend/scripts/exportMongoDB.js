const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: '../.env' });

class MongoDBExporter {
  constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27018/tropicool', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    this.db = null;
  }

  /**
   * Se connecter à MongoDB
   */
  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db();
      console.log('✅ Connecté à MongoDB');
    } catch (error) {
      console.error('❌ Erreur de connexion MongoDB:', error);
      throw error;
    }
  }

  /**
   * Exporter toutes les données MongoDB pour contrôle INPI
   */
  async exportAllData(outputDir = './exports') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportId = crypto.randomBytes(8).toString('hex');
    
    console.log(`🔄 Début de l'export MongoDB - ID: ${exportId}`);
    
    try {
      await this.connect();

      // Créer le dossier d'export
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const exportPath = path.join(outputDir, `mongodb_export_${timestamp}_${exportId}`);
      fs.mkdirSync(exportPath, { recursive: true });

      // Métadonnées de l'export
      const metadata = {
        exportId,
        timestamp: new Date().toISOString(),
        database: this.db.databaseName,
        version: '1.0',
        purpose: 'INPI_CONTROL_RGPD_COMPLIANCE',
        description: 'Export complet des données MongoDB pour contrôle de conformité RGPD',
        collections: [],
        recordCounts: {},
        checksums: {}
      };

      // Liste des collections à exporter
      const collections = [
        'users',
        'categories',
        'products',
        'orders',
        'carts'
      ];

      // Exporter chaque collection
      for (const collectionName of collections) {
        console.log(`📊 Export de la collection: ${collectionName}`);
        
        const collectionData = await this.exportCollection(collectionName);
        const collectionPath = path.join(exportPath, `${collectionName}.json`);
        
        // Sauvegarder les données
        fs.writeFileSync(collectionPath, JSON.stringify(collectionData, null, 2));
        
        // Calculer le checksum
        const checksum = crypto.createHash('sha256').update(JSON.stringify(collectionData)).digest('hex');
        
        // Ajouter aux métadonnées
        metadata.collections.push({
          name: collectionName,
          recordCount: collectionData.data.length,
          file: `${collectionName}.json`,
          checksum: checksum,
          exportedAt: new Date().toISOString()
        });
        
        metadata.recordCounts[collectionName] = collectionData.data.length;
        metadata.checksums[collectionName] = checksum;
      }

      // Exporter les index et schémas
      const indexes = await this.exportIndexes();
      const indexesPath = path.join(exportPath, 'database_indexes.json');
      fs.writeFileSync(indexesPath, JSON.stringify(indexes, null, 2));

      // Exporter les statistiques de la base
      const stats = await this.exportDatabaseStats();
      const statsPath = path.join(exportPath, 'database_stats.json');
      fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

      // Sauvegarder les métadonnées
      const metadataPath = path.join(exportPath, 'export_metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      // Créer un fichier de vérification d'intégrité
      const integrityReport = await this.generateIntegrityReport(metadata);
      const integrityPath = path.join(exportPath, 'integrity_report.json');
      fs.writeFileSync(integrityPath, JSON.stringify(integrityReport, null, 2));

      // Créer un fichier README
      const readme = this.generateReadme(metadata, exportPath);
      const readmePath = path.join(exportPath, 'README.md');
      fs.writeFileSync(readmePath, readme);

      console.log(`✅ Export MongoDB terminé avec succès`);
      console.log(`📁 Dossier d'export: ${exportPath}`);
      console.log(`📊 Total d'enregistrements: ${Object.values(metadata.recordCounts).reduce((a, b) => a + b, 0)}`);

      return {
        success: true,
        exportId,
        exportPath,
        metadata,
        integrityReport
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'export MongoDB:', error);
      throw error;
    } finally {
      await this.client.close();
    }
  }

  /**
   * Exporter une collection spécifique
   */
  async exportCollection(collectionName) {
    try {
      const collection = this.db.collection(collectionName);
      
      // Obtenir les statistiques de la collection
      const stats = await collection.stats();
      
      // Exporter tous les documents
      const documents = await collection.find({}).toArray();
      
      // Obtenir les index de la collection
      const indexes = await collection.indexes();

      return {
        collection: collectionName,
        stats: {
          count: stats.count,
          size: stats.size,
          avgObjSize: stats.avgObjSize,
          storageSize: stats.storageSize,
          indexes: stats.nindexes
        },
        indexes: indexes,
        data: documents,
        exportedAt: new Date().toISOString(),
        recordCount: documents.length
      };

    } catch (error) {
      console.error(`❌ Erreur lors de l'export de la collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Exporter tous les index de la base de données
   */
  async exportIndexes() {
    try {
      const collections = await this.db.listCollections().toArray();
      const allIndexes = {};

      for (const collection of collections) {
        const collectionObj = this.db.collection(collection.name);
        const indexes = await collectionObj.indexes();
        allIndexes[collection.name] = indexes;
      }

      return {
        database: this.db.databaseName,
        exportedAt: new Date().toISOString(),
        indexes: allIndexes
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'export des index:', error);
      throw error;
    }
  }

  /**
   * Exporter les statistiques de la base de données
   */
  async exportDatabaseStats() {
    try {
      const stats = await this.db.stats();
      
      return {
        database: this.db.databaseName,
        exportedAt: new Date().toISOString(),
        stats: {
          collections: stats.collections,
          views: stats.views,
          objects: stats.objects,
          avgObjSize: stats.avgObjSize,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes,
          indexSize: stats.indexSize,
          scaleFactor: stats.scaleFactor,
          fsUsedSize: stats.fsUsedSize,
          fsTotalSize: stats.fsTotalSize
        }
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'export des statistiques:', error);
      throw error;
    }
  }

  /**
   * Générer un rapport d'intégrité
   */
  async generateIntegrityReport(metadata) {
    const report = {
      exportId: metadata.exportId,
      timestamp: new Date().toISOString(),
      integrityChecks: {},
      summary: {
        totalCollections: metadata.collections.length,
        totalRecords: Object.values(metadata.recordCounts).reduce((a, b) => a + b, 0),
        exportSize: 0,
        verificationStatus: 'PENDING'
      }
    };

    // Vérifier l'intégrité de chaque collection
    for (const collection of metadata.collections) {
      const collectionPath = path.join('./exports', `mongodb_export_${metadata.timestamp.replace(/[:.]/g, '-')}_${metadata.exportId}`, `${collection.name}.json`);
      
      if (fs.existsSync(collectionPath)) {
        const fileContent = fs.readFileSync(collectionPath, 'utf8');
        const fileChecksum = crypto.createHash('sha256').update(fileContent).digest('hex');
        
        report.integrityChecks[collection.name] = {
          fileExists: true,
          checksumMatch: fileChecksum === collection.checksum,
          fileSize: fs.statSync(collectionPath).size,
          recordCount: collection.recordCount,
          status: fileChecksum === collection.checksum ? 'VALID' : 'CHECKSUM_MISMATCH'
        };
      } else {
        report.integrityChecks[collection.name] = {
          fileExists: false,
          checksumMatch: false,
          fileSize: 0,
          recordCount: 0,
          status: 'FILE_MISSING'
        };
      }
    }

    // Calculer la taille totale
    report.summary.exportSize = Object.values(report.integrityChecks)
      .reduce((total, check) => total + check.fileSize, 0);

    // Déterminer le statut global
    const allValid = Object.values(report.integrityChecks)
      .every(check => check.status === 'VALID');
    
    report.summary.verificationStatus = allValid ? 'VALID' : 'INVALID';

    return report;
  }

  /**
   * Générer un fichier README
   */
  generateReadme(metadata, exportPath) {
    return `# Export MongoDB - Tropicool

## Informations Générales

- **ID d'export**: ${metadata.exportId}
- **Date d'export**: ${metadata.timestamp}
- **Base de données**: ${metadata.database}
- **Version**: ${metadata.version}
- **Objectif**: ${metadata.purpose}

## Description

Cet export contient toutes les données de la base MongoDB de l'application Tropicool.
Il a été généré pour répondre aux exigences de conformité RGPD et permettre le contrôle par l'INPI.

## Structure des Fichiers

### Données
- \`users.json\` - Utilisateurs et comptes (données dénormalisées)
- \`categories.json\` - Catégories de produits
- \`products.json\` - Produits avec métadonnées
- \`orders.json\` - Commandes et historique
- \`carts.json\` - Paniers utilisateurs

### Métadonnées
- \`export_metadata.json\` - Métadonnées de l'export
- \`integrity_report.json\` - Rapport d'intégrité
- \`database_indexes.json\` - Index de la base de données
- \`database_stats.json\` - Statistiques de la base
- \`README.md\` - Ce fichier

## Statistiques

${Object.entries(metadata.recordCounts).map(([collection, count]) => `- **${collection}**: ${count} enregistrements`).join('\n')}

**Total**: ${Object.values(metadata.recordCounts).reduce((a, b) => a + b, 0)} enregistrements

## Vérification d'Intégrité

Pour vérifier l'intégrité de l'export :

1. Consultez le fichier \`integrity_report.json\`
2. Vérifiez que tous les statuts sont "VALID"
3. Comparez les checksums SHA256 si nécessaire

## Conformité RGPD

Cet export respecte les exigences RGPD :
- ✅ Données complètes et non modifiées
- ✅ Métadonnées d'audit complètes
- ✅ Vérification d'intégrité
- ✅ Traçabilité de l'export

## Utilisation

Les données sont au format JSON et peuvent être importées dans n'importe quel système compatible MongoDB.
Les fichiers d'index permettent de recréer la structure de la base de données si nécessaire.

## Architecture

Cette base MongoDB contient les données dénormalisées pour optimiser les performances de lecture :
- Données utilisateur avec préférences intégrées
- Produits avec catégories et métadonnées
- Commandes avec historique complet
- Paniers avec produits et prix

## Contact

Pour toute question concernant cet export, contactez l'équipe technique de Tropicool.

---
*Export généré automatiquement le ${metadata.timestamp}*
`;
  }

  /**
   * Exporter des données spécifiques pour audit
   */
  async exportForAudit(auditType = 'RGPD') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const auditId = crypto.randomBytes(8).toString('hex');
    
    console.log(`🔍 Début de l'audit ${auditType} - ID: ${auditId}`);

    try {
      await this.connect();

      const auditData = {
        auditId,
        auditType,
        timestamp: new Date().toISOString(),
        database: this.db.databaseName,
        findings: {}
      };

      // Audit des utilisateurs anonymisés
      const anonymizedUsers = await this.db.collection('users').countDocuments({
        is_anonymized: true
      });
      auditData.findings.anonymizedUsers = anonymizedUsers;

      // Audit des utilisateurs actifs
      const activeUsers = await this.db.collection('users').countDocuments({
        is_anonymized: { $ne: true }
      });
      auditData.findings.activeUsers = activeUsers;

      // Audit des commandes
      const totalOrders = await this.db.collection('orders').countDocuments();
      auditData.findings.totalOrders = totalOrders;

      // Audit des produits
      const totalProducts = await this.db.collection('products').countDocuments();
      auditData.findings.totalProducts = totalProducts;

      // Audit des données personnelles
      const usersWithEmail = await this.db.collection('users').countDocuments({
        email: { $exists: true, $ne: null }
      });
      auditData.findings.usersWithEmail = usersWithEmail;

      const usersWithPhone = await this.db.collection('users').countDocuments({
        phone: { $exists: true, $ne: null }
      });
      auditData.findings.usersWithPhone = usersWithPhone;

      console.log(`✅ Audit ${auditType} terminé`);
      return auditData;

    } catch (error) {
      console.error(`❌ Erreur lors de l'audit ${auditType}:`, error);
      throw error;
    }
  }

  /**
   * Exporter des données spécifiques par collection
   */
  async exportCollectionData(collectionName, query = {}, options = {}) {
    try {
      await this.connect();
      
      const collection = this.db.collection(collectionName);
      const documents = await collection.find(query, options).toArray();
      
      return {
        collection: collectionName,
        query: query,
        options: options,
        data: documents,
        exportedAt: new Date().toISOString(),
        recordCount: documents.length
      };

    } catch (error) {
      console.error(`❌ Erreur lors de l'export de ${collectionName}:`, error);
      throw error;
    }
  }
}

// Fonction d'export principal
async function main() {
  const exporter = new MongoDBExporter();
  
  try {
    // Export complet
    const result = await exporter.exportAllData();
    console.log('🎉 Export MongoDB réussi !');
    console.log(`📁 Dossier: ${result.exportPath}`);
    
    // Audit RGPD
    const audit = await exporter.exportForAudit('RGPD');
    console.log('🔍 Audit RGPD terminé:', audit.findings);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = MongoDBExporter; 