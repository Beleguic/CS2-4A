#!/bin/bash

# Script de nettoyage et réinstallation des dépendances
echo "🧹 Nettoyage des dépendances..."

# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Nettoyer le cache npm
npm cache clean --force

# Réinstaller les dépendances
echo "📦 Réinstallation des dépendances..."
npm install --force

echo "✅ Nettoyage terminé !"
