const AutomatedExportService = require('../services/automatedExportService');
const PostgreSQLExporter = require('../scripts/exportPostgreSQL');
const MongoDBExporter = require('../scripts/exportMongoDB');
const fs = require('fs');
const path = require('path');

class ExportController {
  constructor() {
    this.exportService = new AutomatedExportService();
  }

  /**
   * Exporter toutes les données pour contrôle INPI
   */
  async exportForINPI(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      console.log('🔄 Début de l\'export INPI demandé par:', req.user.email);

      const result = await this.exportService.exportForINPI();

      res.json({
        success: true,
        message: 'Export INPI généré avec succès',
        exportId: result.exportId,
        exportPath: result.exportPath,
        zipPath: result.zipPath,
        summary: {
          totalRecords: result.metadata.summary.totalRecords,
          databases: Object.keys(result.metadata.databases),
          integrityStatus: result.globalIntegrityReport.globalStatus
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de l\'export INPI:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la génération de l\'export INPI',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Exporter uniquement PostgreSQL
   */
  async exportPostgreSQL(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const exporter = new PostgreSQLExporter();
      const result = await exporter.exportAllData();

      res.json({
        success: true,
        message: 'Export PostgreSQL généré avec succès',
        exportId: result.exportId,
        exportPath: result.exportPath,
        summary: {
          totalRecords: Object.values(result.metadata.recordCounts).reduce((a, b) => a + b, 0),
          tables: Object.keys(result.metadata.recordCounts),
          integrityStatus: result.integrityReport.summary.verificationStatus
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de l\'export PostgreSQL:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la génération de l\'export PostgreSQL',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Exporter uniquement MongoDB
   */
  async exportMongoDB(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const exporter = new MongoDBExporter();
      const result = await exporter.exportAllData();

      res.json({
        success: true,
        message: 'Export MongoDB généré avec succès',
        exportId: result.exportId,
        exportPath: result.exportPath,
        summary: {
          totalRecords: Object.values(result.metadata.recordCounts).reduce((a, b) => a + b, 0),
          collections: Object.keys(result.metadata.recordCounts),
          integrityStatus: result.integrityReport.summary.verificationStatus
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de l\'export MongoDB:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la génération de l\'export MongoDB',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Lister les exports disponibles
   */
  async listExports(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const exportsDir = './exports';
      const exports = [];

      if (fs.existsSync(exportsDir)) {
        const files = fs.readdirSync(exportsDir);
        
        for (const file of files) {
          const filePath = path.join(exportsDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            const metadataPath = path.join(filePath, 'export_metadata.json');
            
            if (fs.existsSync(metadataPath)) {
              try {
                const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                exports.push({
                  name: file,
                  type: this.getExportType(file),
                  exportId: metadata.exportId,
                  timestamp: metadata.timestamp,
                  size: this.getDirectorySize(filePath),
                  recordCount: metadata.summary?.totalRecords || 0,
                  integrityStatus: metadata.summary?.verificationStatus || 'UNKNOWN'
                });
              } catch (error) {
                console.error(`Erreur lors de la lecture des métadonnées de ${file}:`, error);
              }
            }
          }
        }
      }

      // Trier par date (plus récent en premier)
      exports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.json({
        success: true,
        exports: exports,
        total: exports.length
      });

    } catch (error) {
      console.error('❌ Erreur lors de la liste des exports:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération de la liste des exports',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir les détails d'un export spécifique
   */
  async getExportDetails(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const { exportId } = req.params;
      const exportsDir = './exports';
      
      if (!fs.existsSync(exportsDir)) {
        return res.status(404).json({ 
          error: 'Aucun export trouvé' 
        });
      }

      const files = fs.readdirSync(exportsDir);
      let exportDetails = null;

      for (const file of files) {
        const filePath = path.join(exportsDir, file);
        const metadataPath = path.join(filePath, 'export_metadata.json');
        
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            
            if (metadata.exportId === exportId) {
              exportDetails = {
                name: file,
                type: this.getExportType(file),
                metadata: metadata,
                files: this.getExportFiles(filePath),
                size: this.getDirectorySize(filePath)
              };
              break;
            }
          } catch (error) {
            console.error(`Erreur lors de la lecture des métadonnées de ${file}:`, error);
          }
        }
      }

      if (!exportDetails) {
        return res.status(404).json({ 
          error: 'Export non trouvé' 
        });
      }

      res.json({
        success: true,
        export: exportDetails
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des détails de l\'export:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des détails de l\'export',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Télécharger un export
   */
  async downloadExport(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const { exportId } = req.params;
      const exportsDir = './exports';
      
      if (!fs.existsSync(exportsDir)) {
        return res.status(404).json({ 
          error: 'Aucun export trouvé' 
        });
      }

      const files = fs.readdirSync(exportsDir);
      let exportPath = null;

      for (const file of files) {
        const filePath = path.join(exportsDir, file);
        const metadataPath = path.join(filePath, 'export_metadata.json');
        
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            
            if (metadata.exportId === exportId) {
              exportPath = filePath;
              break;
            }
          } catch (error) {
            console.error(`Erreur lors de la lecture des métadonnées de ${file}:`, error);
          }
        }
      }

      if (!exportPath) {
        return res.status(404).json({ 
          error: 'Export non trouvé' 
        });
      }

      // Vérifier s'il y a un fichier ZIP
      const zipFiles = fs.readdirSync(exportPath).filter(f => f.endsWith('.zip'));
      
      if (zipFiles.length > 0) {
        const zipPath = path.join(exportPath, zipFiles[0]);
        res.download(zipPath, zipFiles[0]);
      } else {
        // Créer un ZIP à la volée
        const archiver = require('archiver');
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        res.attachment(`${path.basename(exportPath)}.zip`);
        archive.pipe(res);
        archive.directory(exportPath, false);
        archive.finalize();
      }

    } catch (error) {
      console.error('❌ Erreur lors du téléchargement de l\'export:', error);
      res.status(500).json({ 
        error: 'Erreur lors du téléchargement de l\'export',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Supprimer un export
   */
  async deleteExport(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const { exportId } = req.params;
      const exportsDir = './exports';
      
      if (!fs.existsSync(exportsDir)) {
        return res.status(404).json({ 
          error: 'Aucun export trouvé' 
        });
      }

      const files = fs.readdirSync(exportsDir);
      let exportPath = null;

      for (const file of files) {
        const filePath = path.join(exportsDir, file);
        const metadataPath = path.join(filePath, 'export_metadata.json');
        
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            
            if (metadata.exportId === exportId) {
              exportPath = filePath;
              break;
            }
          } catch (error) {
            console.error(`Erreur lors de la lecture des métadonnées de ${file}:`, error);
          }
        }
      }

      if (!exportPath) {
        return res.status(404).json({ 
          error: 'Export non trouvé' 
        });
      }

      // Supprimer le dossier
      fs.rmSync(exportPath, { recursive: true, force: true });

      res.json({
        success: true,
        message: 'Export supprimé avec succès'
      });

    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'export:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la suppression de l\'export',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Nettoyer les anciens exports
   */
  async cleanupExports(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const { retentionDays = 90 } = req.body;
      const result = await this.exportService.cleanupOldExports(retentionDays);

      res.json({
        success: true,
        message: 'Nettoyage des exports terminé',
        deleted: result.deleted,
        errors: result.errors
      });

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des exports:', error);
      res.status(500).json({ 
        error: 'Erreur lors du nettoyage des exports',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir la documentation des exports
   */
  async getExportDocumentation(req, res) {
    try {
      const documentation = {
        title: 'Documentation des Exports - Tropicool',
        version: '1.0',
        description: 'Documentation complète du système d\'export pour conformité RGPD et contrôle INPI',
        sections: [
          {
            title: 'Types d\'Export',
            content: [
              {
                type: 'INPI',
                description: 'Export complet automatisé pour contrôle INPI',
                includes: ['PostgreSQL + MongoDB', 'Rapports d\'intégrité', 'Conformité RGPD', 'Archive ZIP'],
                frequency: 'Sur demande ou automatique'
              },
              {
                type: 'PostgreSQL',
                description: 'Export de la base de données relationnelle',
                includes: ['Données transactionnelles', 'Schéma SQL', 'Index', 'Métadonnées'],
                frequency: 'Sur demande'
              },
              {
                type: 'MongoDB',
                description: 'Export de la base de données document',
                includes: ['Données dénormalisées', 'Index', 'Statistiques', 'Métadonnées'],
                frequency: 'Sur demande'
              }
            ]
          },
          {
            title: 'Conformité RGPD',
            content: [
              'Droit à la portabilité des données',
              'Vérification d\'intégrité complète',
              'Métadonnées d\'audit traçables',
              'Anonymisation des données sensibles',
              'Rapports de conformité inclus'
            ]
          },
          {
            title: 'Sécurité',
            content: [
              'Checksums SHA256 pour chaque fichier',
              'Vérification d\'intégrité automatique',
              'Accès restreint aux administrateurs',
              'Logs d\'audit complets',
              'Chiffrement des archives'
            ]
          },
          {
            title: 'Utilisation',
            content: [
              'Exports générés automatiquement ou sur demande',
              'Téléchargement sécurisé via API',
              'Rétention configurable des exports',
              'Documentation complète incluse',
              'Support pour contrôle INPI'
            ]
          }
        ],
        api: {
          endpoints: [
            {
              method: 'POST',
              path: '/api/exports/inpi',
              description: 'Générer un export complet pour INPI',
              auth: 'Admin requis'
            },
            {
              method: 'POST',
              path: '/api/exports/postgresql',
              description: 'Générer un export PostgreSQL',
              auth: 'Admin requis'
            },
            {
              method: 'POST',
              path: '/api/exports/mongodb',
              description: 'Générer un export MongoDB',
              auth: 'Admin requis'
            },
            {
              method: 'GET',
              path: '/api/exports',
              description: 'Lister tous les exports disponibles',
              auth: 'Admin requis'
            },
            {
              method: 'GET',
              path: '/api/exports/:exportId',
              description: 'Obtenir les détails d\'un export',
              auth: 'Admin requis'
            },
            {
              method: 'GET',
              path: '/api/exports/:exportId/download',
              description: 'Télécharger un export',
              auth: 'Admin requis'
            },
            {
              method: 'DELETE',
              path: '/api/exports/:exportId',
              description: 'Supprimer un export',
              auth: 'Admin requis'
            },
            {
              method: 'POST',
              path: '/api/exports/cleanup',
              description: 'Nettoyer les anciens exports',
              auth: 'Admin requis'
            }
          ]
        }
      };

      res.json({
        success: true,
        documentation: documentation
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la documentation:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération de la documentation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Méthodes utilitaires privées
  getExportType(filename) {
    if (filename.includes('inpi_export')) return 'INPI';
    if (filename.includes('postgresql_export')) return 'PostgreSQL';
    if (filename.includes('mongodb_export')) return 'MongoDB';
    return 'Unknown';
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    const calculateSize = (path) => {
      const stats = fs.statSync(path);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(path);
        files.forEach(file => calculateSize(path.join(path, file)));
      } else {
        totalSize += stats.size;
      }
    };

    calculateSize(dirPath);
    return totalSize;
  }

  getExportFiles(exportPath) {
    const files = [];
    
    const scanDirectory = (dir, prefix = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        const relativePath = path.join(prefix, item);
        
        if (stats.isDirectory()) {
          files.push({
            name: relativePath,
            type: 'directory',
            size: this.getDirectorySize(fullPath)
          });
          scanDirectory(fullPath, relativePath);
        } else {
          files.push({
            name: relativePath,
            type: 'file',
            size: stats.size
          });
        }
      }
    };

    scanDirectory(exportPath);
    return files;
  }
}

module.exports = new ExportController(); 