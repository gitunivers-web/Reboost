#!/bin/bash

# Script de build Vercel pour injecter les variables d'environnement dans Vite
# Ce script crée un fichier .env à partir des variables Vercel avant le build

echo "🔧 Création du fichier .env pour Vite..."

# Créer le fichier .env avec les variables Vercel
cat > .env << EOL
VITE_API_URL=$VITE_API_URL
VITE_SOCKET_URL=$VITE_SOCKET_URL
VITE_SITE_URL=$VITE_SITE_URL
EOL

echo "✅ Fichier .env créé avec succès:"
cat .env

echo ""
echo "📦 Lancement du build frontend..."
npm run build:frontend

echo ""
echo "✅ Build terminé!"
