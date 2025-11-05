# Guide de Déploiement - ALTUS

## Architecture de Déploiement

- **Frontend** : Déployé sur **Vercel**
- **Backend** : Déployé sur **Render** (ou Railway, Heroku, etc.)
- **Base de données** : PostgreSQL (Neon, Railway, Supabase, etc.)

## 📦 Backend (Render)

### Configuration Render

1. **Créer un nouveau Web Service** sur Render
2. **Connecter votre dépôt GitHub**
3. **Configuration** :

   ```
   Name: altus-backend
   Region: Frankfurt (Europe)
   Branch: main
   Root Directory: (laisser vide)
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Variables d'environnement** (Settings > Environment) :

   ```bash
   NODE_ENV=production
   PORT=5000
   SESSION_SECRET=<générer avec: openssl rand -base64 32>
   DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
   SENDGRID_API_KEY=<votre clé SendGrid (optionnel)>
   ```

5. **Health Check Path** : `/health`

### Obtenir l'URL du backend

Après le déploiement, Render vous donnera une URL comme :
```
https://altus-backend.onrender.com
```

Notez cette URL, vous en aurez besoin pour le frontend.

## 🎨 Frontend (Vercel)

### Configuration Vercel

1. **Créer un nouveau projet** sur Vercel
2. **Importer votre dépôt GitHub**
3. **Framework Preset** : `Vite`
4. **Build & Development Settings** :

   ```
   Build Command: npm run build
   Output Directory: dist/public
   Install Command: npm install
   ```

5. **Variables d'environnement** (Settings > Environment Variables) :

   ```bash
   VITE_API_URL=https://altus-backend.onrender.com
   ```

   ⚠️ **Important** : Remplacez par l'URL de votre backend Render.

### Fichier vercel.json

Le fichier `vercel.json` est déjà configuré :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "framework": null,
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🗄️ Base de Données PostgreSQL

### Option 1 : Neon (Recommandé)

1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un nouveau projet
3. Copier l'URL de connexion (DATABASE_URL)
4. Ajouter `?sslmode=require` à la fin de l'URL

### Option 2 : Railway

1. Créer un compte sur [railway.app](https://railway.app)
2. Créer un nouveau projet PostgreSQL
3. Copier la variable DATABASE_URL

### Option 3 : Supabase

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans Settings > Database
4. Copier l'URI de connexion PostgreSQL

## 👨‍💼 Créer le Compte Administrateur

Le système ne crée pas automatiquement de compte admin. Vous devez le créer manuellement.

### Méthode 1 : SQL Direct

Connectez-vous à votre base de données PostgreSQL et exécutez :

```sql
-- 1. Générer le hash du mot de passe (exemple avec bcrypt cost=10)
-- Utilisez un outil en ligne ou Node.js pour hasher votre mot de passe
-- Exemple: mot de passe "Admin123!@#" devient:
-- $2b$10$rK8Y/HZ8L.UZ9xQQhVRkH.mF6pJNYJxKdOXmY4YHhP5uGJKvHEJKS

-- 2. Insérer le compte admin
INSERT INTO users (
  id,
  username, 
  password,
  email,
  "fullName",
  "accountType",
  role,
  status,
  "kycStatus",
  "hasSeenWelcomeMessage",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin',
  '$2b$10$rK8Y/HZ8L.UZ9xQQhVRkH.mF6pJNYJxKdOXmY4YHhP5uGJKvHEJKS',
  'admin@altusgroup.com',
  'Administrateur Principal',
  'business',
  'admin',
  'active',
  'approved',
  true,
  NOW(),
  NOW()
);
```

### Méthode 2 : Générer le hash bcrypt

```bash
# Sur votre machine avec Node.js installé
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('VotreMotDePasse123!', 10, (err, hash) => console.log(hash));"
```

Remplacez le hash dans la requête SQL ci-dessus.

## 🔐 Se Connecter en Admin

1. Allez sur votre site Vercel
2. Cliquez sur "Mon espace"
3. Connectez-vous avec :
   - **Email** : `admin@altusgroup.com`
   - **Mot de passe** : Le mot de passe que vous avez hashé

## 🧪 Tester le Déploiement

### Backend (Render)

```bash
# Health check
curl https://altus-backend.onrender.com/health

# Devrait retourner:
# {"status":"ok","timestamp":"2025-11-05T19:48:00.000Z"}
```

### Frontend (Vercel)

1. Visitez votre URL Vercel
2. Vérifiez que le site charge correctement
3. Testez le changement de langue (en haut à droite)
4. Essayez de vous connecter

## 🔧 Dépannage

### Backend ne démarre pas

1. Vérifiez les logs Render
2. Assurez-vous que `SESSION_SECRET` et `DATABASE_URL` sont définis
3. Vérifiez que la base de données est accessible

### Frontend affiche "CHARGEMENT" en français

Si le bouton de chargement reste en français :
- Vérifiez que le build frontend s'est bien terminé
- Videz le cache du navigateur
- Attendez quelques minutes pour la propagation CDN

### Erreur de connexion API

1. Vérifiez que `VITE_API_URL` pointe vers votre backend Render
2. Assurez-vous qu'il n'y a pas de `/` à la fin de l'URL
3. Vérifiez les logs du backend sur Render

### Base de données ne se connecte pas

1. Vérifiez que `DATABASE_URL` est correct
2. Assurez-vous que `?sslmode=require` est présent
3. Testez la connexion depuis un client PostgreSQL local

## 📝 Notes Importantes

- Le backend ne sert **QUE** l'API (pas le frontend)
- Le frontend ne contient **QUE** les fichiers statiques (HTML, CSS, JS)
- La communication se fait via l'URL définie dans `VITE_API_URL`
- Les sessions sont stockées dans PostgreSQL
- Les fichiers uploadés (KYC, contrats) sont stockés en base64 dans la BD

## 🚀 Commandes Utiles

```bash
# Build local du backend
npm run build

# Démarrer en production localement
npm start

# Développement local
npm run dev

# Vérifier les types TypeScript
npm run check
```
