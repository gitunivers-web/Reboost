#!/usr/bin/env bash
# Build script pour Render.com avec support Puppeteer/Chromium
# Note: Render installe automatiquement les dépendances npm en premier
# Assurez-vous que NPM_CONFIG_PRODUCTION=false est défini dans les variables d'environnement

set -e

echo "🌐 Configuration du cache Puppeteer..."
export PUPPETEER_CACHE_DIR=/opt/render/project/.cache/puppeteer

echo "🔧 Installation de Chrome via Puppeteer..."
npx puppeteer browsers install chrome

echo "✅ Chrome installé avec succès!"
