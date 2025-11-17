# Guide de Déploiement sur Render

Ce projet est maintenant correctement configuré pour être déployé sur Render.

## ✅ Configuration Vérifiée

### Package.json
Le fichier `package.json` contient tous les scripts nécessaires :

```json
{
  "scripts": {
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "vite build",
    "build:backend": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### Dépendances
- ✅ `esbuild` est dans `devDependencies` (ligne 110 du package.json)
- ✅ `vite` est dans `devDependencies` (ligne 115 du package.json)
- ✅ Toutes les dépendances de build sont installées

### Structure de Build
- **Frontend** : compilé dans `dist/public/` par Vite
- **Backend** : compilé dans `dist/index.js` par esbuild
- **Point d'entrée** : `server/index.ts`

## 📋 Instructions de Déploiement sur Render

### 1. Créer un nouveau Web Service sur Render

1. Connectez votre dépôt GitHub à Render
2. Créez un nouveau **Web Service**

### 2. Configuration du Service

Dans les paramètres de votre Web Service Render :

**Build & Deploy :**
- **Build Command** : `bash render-build.sh && npm run build`
- **Start Command** : `npm run start:compiled`
- **Branch** : `main` (ou votre branche principale)

**Environment :**
- **Node Version** : 20.x (recommandé)
- **Region** : Choisissez la région la plus proche de vos utilisateurs

### 3. Variables d'Environnement Requises

Configurez ces variables dans l'onglet "Environment" de Render :

```
NODE_ENV=production
DATABASE_URL=<votre-url-postgresql>
SESSION_SECRET=<générer-une-clé-secrète-forte>
PORT=5000
PUPPETEER_CACHE_DIR=/opt/render/project/.cache/puppeteer
NPM_CONFIG_PRODUCTION=false
```

**⚠️ IMPORTANT - Variables critiques (à configurer dans Render Dashboard → Environment)** :
- `PUPPETEER_CACHE_DIR=/opt/render/project/.cache/puppeteer` : **OBLIGATOIRE** pour la génération de contrats PDF et la persistance du cache Chrome
- `NPM_CONFIG_PRODUCTION=false` : **OBLIGATOIRE** pour installer les devDependencies (vite, esbuild, tsx) nécessaires au build

**Note** : Ces variables DOIVENT être configurées dans le dashboard Render AVANT le premier déploiement, sinon le build échouera.

**Variables Optionnelles (si utilisées) :**
```
SENDGRID_API_KEY=<votre-clé-sendgrid>
VITE_APP_NAME=Altus Group
```

### 4. Configuration de la Base de Données

**Option 1 : PostgreSQL géré par Render**
1. Créez une nouvelle base de données PostgreSQL sur Render
2. Copiez la `DATABASE_URL` dans les variables d'environnement
3. Les migrations seront automatiquement appliquées au démarrage

**Option 2 : Base de données externe (Neon, Supabase, etc.)**
1. Utilisez la `DATABASE_URL` de votre fournisseur
2. Assurez-vous que la connexion SSL est activée

### 5. Migrations de Base de Données

Après le premier déploiement, exécutez les migrations :

```bash
npm run db:push
```

Vous pouvez le faire via le shell Render ou en ajoutant un script de post-déploiement.

### 6. Santé du Service

Le service expose un endpoint de santé :
```
GET /health
```

Configurez Render pour utiliser ce endpoint dans les "Health Checks".

## 🎯 Configuration Puppeteer/Chromium (Génération de contrats PDF)

### Changement Important (Nov 2024)
Le projet a été migré de `puppeteer-core` vers `puppeteer` complet pour résoudre les problèmes de génération de PDF en production.

### Pourquoi ce changement ?
- **Avant** : `puppeteer-core` nécessitait un Chrome/Chromium installé manuellement sur le serveur
- **Après** : `puppeteer` inclut automatiquement Chromium, aucune installation système requise
- **Résultat** : Les contrats PDF sont maintenant générés correctement sur Render

### Configuration requise

**⚠️ Important** : Les trois étapes suivantes sont toutes nécessaires pour que la génération de PDF fonctionne :

1. **Build Command sur Render** : `bash render-build.sh && npm run build`
   - Render installe automatiquement les dépendances npm en premier
   - Le script `render-build.sh` installe ensuite Chrome/Chromium
   - Enfin `npm run build` compile le projet

2. **Variable d'environnement OBLIGATOIRE** : 
   ```
   PUPPETEER_CACHE_DIR=/opt/render/project/.cache/puppeteer
   ```
   Cette variable indique à Puppeteer où stocker le binaire Chrome téléchargé, permettant sa réutilisation entre les déploiements.

3. **Flux de build complet** :
   ```
   1. Render exécute: npm install (avec NPM_CONFIG_PRODUCTION=false pour inclure devDeps)
   2. Render exécute: bash render-build.sh (installe Chrome dans le cache Puppeteer)
   3. Render exécute: npm run build (compile frontend + backend vers dist/)
   4. Runtime: npm run start:compiled (démarre avec node dist/index.js)
   ```

**Pourquoi NPM_CONFIG_PRODUCTION=false ?**
- Render doit installer les devDependencies (vite, esbuild) pour compiler le projet
- Ces outils ne sont nécessaires que pendant le build, pas au runtime
- Sans cette variable, le build échouera car vite et esbuild seront absents

**Pourquoi start:compiled ?**
- En production, on utilise le code compilé (`node dist/index.js`)
- Plus rapide que `tsx` et ne nécessite pas de devDependencies au runtime
- Le bundle est déjà optimisé et prêt à l'emploi

### Vérification
Après déploiement, les logs devraient montrer :
```
✓ Chromium embarqué Puppeteer trouvé: /opt/render/project/.cache/puppeteer/chrome/...
✓ Browser Puppeteer lancé avec succès
✓ PDF généré avec succès: contrat_xxx_xxx.pdf
```

## 🔧 Dépannage

### Problème : "An executablePath must be specified for puppeteer-core"
**Solution** : 
1. Vérifiez que `PUPPETEER_CACHE_DIR` est définie dans les variables d'environnement
2. Vérifiez que le build command est : `bash render-build.sh && npm run build`
3. Consultez les logs de build pour confirmer que Chrome a été installé

### Problème : "Cannot find module"
**Solution** : Assurez-vous que la commande `npm install` s'exécute avant le build

### Problème : "Database connection failed"
**Solution** : Vérifiez que `DATABASE_URL` est correctement configurée avec SSL activé

### Problème : "Port already in use"
**Solution** : Ne modifiez pas le port, Render gère automatiquement le PORT via variable d'environnement

### Problème : "Session store error"
**Solution** : Assurez-vous que `SESSION_SECRET` est défini dans les variables d'environnement

### Problème : "Contract generation fails" (Statut: none)
**Solution** : 
1. Vérifiez les logs pour l'erreur exacte
2. Assurez-vous que `PUPPETEER_CACHE_DIR` est configurée
3. Vérifiez que le build a bien exécuté `npx puppeteer browsers install chrome`

## 📦 Structure des Fichiers de Build

Après un build réussi :
```
dist/
├── index.js              # Serveur backend compilé
└── public/              # Frontend React compilé
    ├── index.html
    ├── assets/
    │   ├── index-*.js
    │   └── index-*.css
    └── ...
```

## 🚀 Commandes Utiles

**Build local** :
```bash
npm run build
```

**Test de production local** :
```bash
npm run build
npm start
```

**Vérifier la santé** :
```bash
curl http://localhost:5000/health
```

## 📝 Notes Importantes

1. **Session Store** : Le projet utilise PostgreSQL pour stocker les sessions. Assurez-vous que `DATABASE_URL` pointe vers une base PostgreSQL.

2. **Sécurité** : Générez une clé `SESSION_SECRET` forte et unique pour la production.

3. **CORS & Helmet** : Le projet utilise Helmet pour la sécurité. Certaines configurations peuvent nécessiter des ajustements selon vos besoins.

4. **Uploads** : Les fichiers uploadés sont stockés localement dans `uploads/`. Pour la production, envisagez un stockage cloud (S3, Cloudinary, etc.).

## ✅ Checklist Pré-Déploiement

- [ ] Variables d'environnement configurées sur Render
- [ ] Base de données PostgreSQL créée et URL configurée
- [ ] SESSION_SECRET généré et ajouté
- [ ] Build testé localement (`npm run build`)
- [ ] Migrations de base de données prêtes (`npm run db:push`)
- [ ] Health check configuré sur Render

---

**Statut du Projet** : ✅ Prêt pour le déploiement sur Render

Tous les scripts et dépendances sont correctement configurés. Le projet a été testé et build avec succès.
