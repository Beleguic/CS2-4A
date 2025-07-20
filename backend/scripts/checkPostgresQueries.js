const fs = require('fs');
const path = require('path');

// Fonction pour analyser un fichier et trouver les requêtes PostgreSQL
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const queries = [];

  const patterns = [
    { regex: /\.findAll\(/, name: 'findAll' },
    { regex: /\.findByPk\(/, name: 'findByPk' },
    { regex: /\.findOne\(/, name: 'findOne' },
    { regex: /\.findAndCountAll\(/, name: 'findAndCountAll' },
    { regex: /\.count\(/, name: 'count' },
    { regex: /\.findOrCreate\(/, name: 'findOrCreate' },
    { regex: /\.findOrBuild\(/, name: 'findOrBuild' },
    { regex: /\.aggregate\(/, name: 'aggregate' }
  ];

  lines.forEach((line, index) => {
    patterns.forEach(pattern => {
      if (pattern.regex.test(line)) {
        queries.push({
          line: index + 1,
          type: pattern.name,
          code: line.trim(),
          file: path.basename(filePath)
        });
      }
    });
  });

  return queries;
}

// Fonction pour analyser récursivement un dossier
function analyzeDirectory(dirPath, fileExtension = '.js') {
  const results = [];
  
  function scanDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else if (item.endsWith(fileExtension)) {
        const queries = analyzeFile(itemPath);
        if (queries.length > 0) {
          results.push({
            file: itemPath,
            queries: queries
          });
        }
      }
    });
  }
  
  scanDirectory(dirPath);
  return results;
}

// Analyser les contrôleurs
console.log('🔍 ANALYSE DES REQUÊTES POSTGRESQL RESTANTES');
console.log('==================================================\n');

const controllersDir = path.join(__dirname, '..', 'controllers');
const results = analyzeDirectory(controllersDir);

// Statistiques globales
let totalQueries = 0;
const queryTypes = {};

// Afficher les résultats
results.forEach(result => {
  console.log(`📁 ${path.basename(result.file)}`);
  console.log(`   ${result.queries.length} requête(s) PostgreSQL trouvée(s):`);
  
  result.queries.forEach(query => {
    console.log(`   ├─ Ligne ${query.line}: ${query.type}`);
    console.log(`   │  ${query.code}`);
    
    totalQueries++;
    queryTypes[query.type] = (queryTypes[query.type] || 0) + 1;
  });
  
  console.log('');
});

// Résumé
console.log('📊 RÉSUMÉ');
console.log('==================================================');
console.log(`Total de requêtes PostgreSQL: ${totalQueries}`);
console.log('Répartition par type:');
Object.entries(queryTypes).forEach(([type, count]) => {
  console.log(`  - ${type}: ${count}`);
});

// Contrôleurs avec le plus de requêtes
console.log('\n🎯 CONTRÔLEURS PRIORITAIRES À MIGRER');
console.log('==================================================');
const sortedResults = results.sort((a, b) => b.queries.length - a.queries.length);
sortedResults.slice(0, 5).forEach((result, index) => {
  console.log(`${index + 1}. ${path.basename(result.file)} (${result.queries.length} requêtes)`);
});

// Recommandations
console.log('\n💡 RECOMMANDATIONS');
console.log('==================================================');
console.log('1. Migrer les contrôleurs avec le plus de requêtes en premier');
console.log('2. Garder les requêtes d\'authentification en PostgreSQL (sécurité)');
console.log('3. Utiliser readService pour toutes les lectures');
console.log('4. Synchroniser automatiquement après chaque écriture');
console.log('5. Tester chaque migration avec les scripts de test');

// Détails des requêtes par type
console.log('\n🔧 DÉTAILS PAR TYPE DE REQUÊTE');
console.log('==================================================');

const queriesByType = {};
results.forEach(result => {
  result.queries.forEach(query => {
    if (!queriesByType[query.type]) {
      queriesByType[query.type] = [];
    }
    queriesByType[query.type].push({
      file: path.basename(result.file),
      line: query.line,
      code: query.code
    });
  });
});

Object.entries(queriesByType).forEach(([type, queries]) => {
  console.log(`\n${type.toUpperCase()} (${queries.length} requêtes):`);
  queries.forEach(query => {
    console.log(`  - ${query.file}:${query.line} - ${query.code.substring(0, 50)}...`);
  });
});

console.log('\n✅ Analyse terminée !'); 