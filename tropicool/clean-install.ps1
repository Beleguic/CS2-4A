# Script PowerShell de nettoyage et réinstallation des dépendances
Write-Host "🧹 Nettoyage des dépendances..." -ForegroundColor Yellow

# Supprimer node_modules et package-lock.json
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ node_modules supprimé" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✅ package-lock.json supprimé" -ForegroundColor Green
}

# Nettoyer le cache npm
Write-Host "🧽 Nettoyage du cache npm..." -ForegroundColor Yellow
npm cache clean --force

# Réinstaller les dépendances
Write-Host "📦 Réinstallation des dépendances..." -ForegroundColor Yellow
npm install --force

Write-Host "✅ Nettoyage terminé !" -ForegroundColor Green
