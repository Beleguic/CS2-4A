const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: '../.env' });

class PostgreSQLExporter {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'tropicool',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  /**
   * Exporter toutes les données PostgreSQL pour contrôle INPI
   */
  async exportAllData(outputDir = './exports') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportId = crypto.randomBytes(8).toString('hex');
    
    console.log(`🔄 Début de l'export PostgreSQL - ID: ${exportId}`);
    
    try {
      // Créer le dossier d'export
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const exportPath = path.join(outputDir, `postgresql_export_${timestamp}_${exportId}`);
      fs.mkdirSync(exportPath, { recursive: true });

      // Métadonnées de l'export
      const metadata = {
        exportId,
        timestamp: new Date().toISOString(),
        database: process.env.DB_NAME || 'tropicool',
        version: '1.0',
        purpose: 'INPI_CONTROL_RGPD_COMPLIANCE',
        description: 'Export complet des données PostgreSQL pour contrôle de conformité RGPD',
        tables: [],
        recordCounts: {},
        checksums: {}
      };

      // Liste des tables à exporter (par ordre de dépendance)
      const tables = [
        'users',
        'password_histories',
        'categories',
        'products',
        'category_products',
        'orders',
        'carts',
        'newsletters',
        'alerts',
        'alert_types',
        'product_promotions',
        'promotion_codes',
        'stocks'
      ];

      // Exporter chaque table
      for (const table of tables) {
        console.log(`📊 Export de la table: ${table}`);
        
        const tableData = await this.exportTable(table);
        const tablePath = path.join(exportPath, `${table}.json`);
        
        // Sauvegarder les données
        fs.writeFileSync(tablePath, JSON.stringify(tableData, null, 2));
        
        // Calculer le checksum
        const checksum = crypto.createHash('sha256').update(JSON.stringify(tableData)).digest('hex');
        
        // Ajouter aux métadonnées
        metadata.tables.push({
          name: table,
          recordCount: tableData.length,
          file: `${table}.json`,
          checksum: checksum,
          exportedAt: new Date().toISOString()
        });
        
        metadata.recordCounts[table] = tableData.length;
        metadata.checksums[table] = checksum;
      }

      // Exporter le schéma de la base de données
      const schema = await this.exportSchema();
      const schemaPath = path.join(exportPath, 'database_schema.sql');
      fs.writeFileSync(schemaPath, schema);

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

      console.log(`✅ Export PostgreSQL terminé avec succès`);
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
      console.error('❌ Erreur lors de l\'export PostgreSQL:', error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }

  /**
   * Exporter une table spécifique
   */
  async exportTable(tableName) {
    try {
      // Obtenir la structure de la table
      const structureQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `;
      
      const structureResult = await this.pool.query(structureQuery, [tableName]);
      const columns = structureResult.rows.map(row => row.column_name);

      // Exporter les données
      const dataQuery = `SELECT * FROM ${tableName}`;
      const dataResult = await this.pool.query(dataQuery);

      return {
        table: tableName,
        structure: structureResult.rows,
        columns: columns,
        data: dataResult.rows,
        exportedAt: new Date().toISOString(),
        recordCount: dataResult.rows.length
      };

    } catch (error) {
      console.error(`❌ Erreur lors de l'export de la table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Exporter le schéma de la base de données
   */
  async exportSchema() {
    try {
      const schemaQuery = `
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `;
      
      const result = await this.pool.query(schemaQuery);
      
      let schema = `-- Schéma de la base de données Tropicool\n`;
      schema += `-- Exporté le: ${new Date().toISOString()}\n`;
      schema += `-- Conformité RGPD - Contrôle INPI\n\n`;

      let currentTable = '';
      
      for (const row of result.rows) {
        if (row.table_name !== currentTable) {
          if (currentTable !== '') {
            schema += `);\n\n`;
          }
          currentTable = row.table_name;
          schema += `CREATE TABLE ${row.table_name} (\n`;
        } else {
          schema += `,\n`;
        }

        let columnDef = `  ${row.column_name} ${row.data_type}`;
        
        if (row.character_maximum_length) {
          columnDef += `(${row.character_maximum_length})`;
        } else if (row.numeric_precision) {
          columnDef += `(${row.numeric_precision}`;
          if (row.numeric_scale) {
            columnDef += `,${row.numeric_scale}`;
          }
          columnDef += `)`;
        }

        if (row.is_nullable === 'NO') {
          columnDef += ` NOT NULL`;
        }

        if (row.column_default) {
          columnDef += ` DEFAULT ${row.column_default}`;
        }

        schema += columnDef;
      }

      if (currentTable !== '') {
        schema += `);\n`;
      }

      return schema;

    } catch (error) {
      console.error('❌ Erreur lors de l\'export du schéma:', error);
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
        totalTables: metadata.tables.length,
        totalRecords: Object.values(metadata.recordCounts).reduce((a, b) => a + b, 0),
        exportSize: 0,
        verificationStatus: 'PENDING'
      }
    };

    // Vérifier l'intégrité de chaque table
    for (const table of metadata.tables) {
      const tablePath = path.join('./exports', `postgresql_export_${metadata.timestamp.replace(/[:.]/g, '-')}_${metadata.exportId}`, `${table.name}.json`);
      
      if (fs.existsSync(tablePath)) {
        const fileContent = fs.readFileSync(tablePath, 'utf8');
        const fileChecksum = crypto.createHash('sha256').update(fileContent).digest('hex');
        
        report.integrityChecks[table.name] = {
          fileExists: true,
          checksumMatch: fileChecksum === table.checksum,
          fileSize: fs.statSync(tablePath).size,
          recordCount: table.recordCount,
          status: fileChecksum === table.checksum ? 'VALID' : 'CHECKSUM_MISMATCH'
        };
      } else {
        report.integrityChecks[table.name] = {
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
    return `# Export PostgreSQL - Tropicool

## Informations Générales

- **ID d'export**: ${metadata.exportId}
- **Date d'export**: ${metadata.timestamp}
- **Base de données**: ${metadata.database}
- **Version**: ${metadata.version}
- **Objectif**: ${metadata.purpose}

## Description

Cet export contient toutes les données de la base PostgreSQL de l'application Tropicool.
Il a été généré pour répondre aux exigences de conformité RGPD et permettre le contrôle par l'INPI.

## Structure des Fichiers

### Données
- \`users.json\` - Utilisateurs et comptes
- \`password_histories.json\` - Historique des mots de passe
- \`categories.json\` - Catégories de produits
- \`products.json\` - Produits
- \`category_products.json\` - Relations catégories-produits
- \`orders.json\` - Commandes
- \`carts.json\` - Paniers
- \`newsletters.json\` - Abonnements newsletter
- \`alerts.json\` - Alertes utilisateurs
- \`alert_types.json\` - Types d'alertes
- \`product_promotions.json\` - Promotions produits
- \`promotion_codes.json\` - Codes promotion
- \`stocks.json\` - Gestion des stocks

### Métadonnées
- \`export_metadata.json\` - Métadonnées de l'export
- \`integrity_report.json\` - Rapport d'intégrité
- \`database_schema.sql\` - Schéma de la base de données
- \`README.md\` - Ce fichier

## Statistiques

${Object.entries(metadata.recordCounts).map(([table, count]) => `- **${table}**: ${count} enregistrements`).join('\n')}

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

Les données sont au format JSON et peuvent être importées dans n'importe quel système compatible.
Le schéma SQL permet de recréer la structure de la base de données si nécessaire.

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
      const auditData = {
        auditId,
        auditType,
        timestamp: new Date().toISOString(),
        database: process.env.DB_NAME || 'tropicool',
        findings: {}
      };

      // Audit des utilisateurs anonymisés
      const anonymizedUsers = await this.pool.query(
        'SELECT COUNT(*) as count FROM users WHERE is_anonymized = true'
      );
      auditData.findings.anonymizedUsers = anonymizedUsers.rows[0].count;

      // Audit des mots de passe expirés
      const expiredPasswords = await this.pool.query(
        'SELECT COUNT(*) as count FROM users WHERE password_expires_at < NOW()'
      );
      auditData.findings.expiredPasswords = expiredPasswords.rows[0].count;

      // Audit des comptes verrouillés
      const lockedAccounts = await this.pool.query(
        'SELECT COUNT(*) as count FROM users WHERE lock_until > NOW()'
      );
      auditData.findings.lockedAccounts = lockedAccounts.rows[0].count;

      // Audit des données personnelles
      const personalData = await this.pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as users_with_email,
          COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as users_with_phone,
          COUNT(CASE WHEN address IS NOT NULL THEN 1 END) as users_with_address
        FROM users
      `);
      auditData.findings.personalData = personalData.rows[0];

      console.log(`✅ Audit ${auditType} terminé`);
      return auditData;

    } catch (error) {
      console.error(`❌ Erreur lors de l'audit ${auditType}:`, error);
      throw error;
    }
  }
}

// Fonction d'export principal
async function main() {
  const exporter = new PostgreSQLExporter();
  
  try {
    // Export complet
    const result = await exporter.exportAllData();
    console.log('🎉 Export PostgreSQL réussi !');
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

module.exports = PostgreSQLExporter; 