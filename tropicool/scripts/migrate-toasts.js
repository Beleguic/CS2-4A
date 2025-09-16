#!/usr/bin/env node

/**
 * Script de migration pour remplacer l'ancien système de toasts par le nouveau
 * Usage: node scripts/migrate-toasts.js [file-path]
 */

const fs = require('fs');
const path = require('path');

function migrateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Fichier non trouvé: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remplacer l'import useToast
  if (content.includes("import { useToast } from 'vue-toast-notification';")) {
    content = content.replace(
      "import { useToast } from 'vue-toast-notification';",
      "import { useToast } from '../composables/useToast';"
    );
    modified = true;
    console.log(`✓ Import useToast migré dans ${filePath}`);
  }

  // Remplacer l'utilisation de $toast.open
  const toastOpenRegex = /\$toast\.open\(\s*\{\s*message:\s*['"`]([^'"`]+)['"`],\s*type:\s*['"`]([^'"`]+)['"`],\s*position:\s*['"`]bottom-left['"`],?\s*\}\s*\)/g;
  
  content = content.replace(toastOpenRegex, (match, message, type) => {
    modified = true;
    const method = type === 'error' ? 'error' : 
                   type === 'success' ? 'success' : 
                   type === 'warning' ? 'warning' : 
                   type === 'info' ? 'info' : 'info';
    
    return `toast.${method}('${message}')`;
  });

  // Remplacer les patterns plus complexes
  const complexToastRegex = /\$toast\.open\(\s*\{\s*message:\s*([^,]+),\s*type:\s*['"`]([^'"`]+)['"`],\s*position:\s*['"`]bottom-left['"`],?\s*\}\s*\)/g;
  
  content = content.replace(complexToastRegex, (match, message, type) => {
    modified = true;
    const method = type === 'error' ? 'error' : 
                   type === 'success' ? 'success' : 
                   type === 'warning' ? 'warning' : 
                   type === 'info' ? 'info' : 'info';
    
    return `toast.${method}(${message})`;
  });

  // Remplacer la déclaration de $toast
  if (content.includes('const $toast = useToast();')) {
    content = content.replace('const $toast = useToast();', 'const toast = useToast();');
    modified = true;
    console.log(`✓ Déclaration $toast migrée dans ${filePath}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fichier migré: ${filePath}`);
  } else {
    console.log(`- Aucune migration nécessaire: ${filePath}`);
  }
}

function findVueFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findVueFiles(fullPath));
    } else if (item.endsWith('.vue') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Migration de tous les fichiers Vue/TS...');
    const srcDir = path.join(__dirname, '..', 'src');
    const files = findVueFiles(srcDir);
    
    for (const file of files) {
      migrateFile(file);
    }
  } else {
    const filePath = args[0];
    migrateFile(filePath);
  }
  
  console.log('\nMigration terminée !');
  console.log('\nN\'oubliez pas de :');
  console.log('1. Vérifier que les imports sont corrects');
  console.log('2. Tester l\'application');
  console.log('3. Utiliser les méthodes spécialisées (toast.apiError, toast.saved, etc.)');
}

main();
