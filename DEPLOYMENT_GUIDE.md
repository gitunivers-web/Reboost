# Guide de Déploiement - Altus Group

## 📋 Vue d'ensemble

Ce guide vous explique comment déployer votre application en production avec :
- **Frontend** : Vercel → `altusfinancegroup.com`
- **Backend** : Render → `api.altusfinancegroup.com`
- **Base de données** : PostgreSQL (Neon, Render PostgreSQL, ou autre)
- **Emails** : SendGrid

---

## 🔐 Variables d'Environnement Requises

### Backend (Render)

Créez ces variables d'environnement dans votre projet Render :

```bash
# Base de données PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/database_name

# Session (OBLIGATOIRE - Générez une clé secrète forte)
SESSION_SECRET=votre_cle_secrete_forte_et_aleatoire_32_caracteres_minimum

# SendGrid pour les emails
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@votredomaine.com
SENDGRID_FROM_NAME=Altus Group

# Environnement
NODE_ENV=production

# URL du frontend (pour les liens dans les emails)
FRONTEND_URL=https://votre-app.vercel.app
```

### Frontend (Vercel)

Créez ces variables d'environnement dans **Vercel → Project Settings → Environment Variables** :

```bash
# URL du backend API (OBLIGATOIRE)
VITE_API_URL=https://api.altusfinancegroup.com

# URL du site pour SEO et Open Graph (RECOMMANDÉ)
VITE_SITE_URL=https://altusfinancegroup.com
```

⚠️ **IMPORTANT** : Ces variables doivent être préfixées par `VITE_` pour être accessibles dans le code frontend.

---

## 🗄️ Configuration de la Base de Données PostgreSQL

### Option 1 : Utiliser Render PostgreSQL (Recommandé)

1. **Créer une base de données PostgreSQL sur Render** :
   - Allez sur https://dashboard.render.com
   - Cliquez sur "New +" → "PostgreSQL"
   - Donnez un nom (ex: `altus-group-db`)
   - Choisissez le plan gratuit ou payant selon vos besoins
   - Cliquez sur "Create Database"

2. **Récupérer l'URL de connexion** :
   - Sur la page de votre base de données, copiez l'"Internal Database URL"
   - Elle ressemble à : `postgresql://altus_user:xxxxx@dpg-xxxxx/altus_db`

3. **Ajouter DATABASE_URL à votre service backend Render** :
   - Allez dans votre service backend
   - Section "Environment"
   - Ajoutez la variable `DATABASE_URL` avec l'URL copiée

### Option 2 : Utiliser Neon PostgreSQL

1. **Créer une base de données sur Neon** :
   - Allez sur https://neon.tech
   - Créez un nouveau projet
   - Copiez la connexion string PostgreSQL

2. **Ajouter à Render** :
   - Ajoutez `DATABASE_URL` dans vos variables d'environnement backend

### Migration des Données depuis MemStorage

⚠️ **L'application utilise actuellement un stockage en mémoire (MemStorage)**. Voici comment migrer vers PostgreSQL :

1. **La base de données est déjà configurée** :
   - Le code inclut déjà le schéma Drizzle ORM dans `shared/schema.ts`
   - Les types sont définis et prêts

2. **Basculer vers PostgreSQL** :
   
   a. Dans `server/storage.ts`, décommentez ou activez `DbStorage` au lieu de `MemStorage`
   
   b. Le fichier devrait utiliser la connexion à la base de données :
   ```typescript
   // Utilisez DbStorage au lieu de MemStorage
   export const storage = new DbStorage();
   ```

3. **Initialiser la base de données** :
   ```bash
   # En local d'abord pour tester
   npm run db:push
   ```
   
   Cette commande crée toutes les tables nécessaires dans PostgreSQL.

4. **Données de démonstration** :
   - En production, vous commencerez avec une base vide
   - Les utilisateurs devront s'inscrire via le formulaire d'inscription
   - Vous pouvez créer un script de seed pour ajouter des données initiales si nécessaire

---

## 📧 Configuration SendGrid

SendGrid est utilisé pour envoyer les emails de vérification et de bienvenue.

### 1. Créer un compte SendGrid

1. Allez sur https://sendgrid.com
2. Créez un compte gratuit (permet 100 emails/jour)
3. Vérifiez votre email

### 2. Créer une clé API

1. Dans le dashboard SendGrid, allez dans **Settings** → **API Keys**
2. Cliquez sur **Create API Key**
3. Nom : `Altus Group Production`
4. Permissions : **Full Access** (ou au minimum "Mail Send")
5. Copiez la clé API (elle commence par `SG.`)

### 3. Vérifier un domaine ou email

**Option A : Vérifier une adresse email unique** (gratuit, plus simple)
1. Allez dans **Settings** → **Sender Authentication**
2. Choisissez **Single Sender Verification**
3. Entrez votre email (ex: noreply@gmail.com)
4. Vérifiez l'email reçu

**Option B : Authentifier un domaine complet** (recommandé pour production)
1. Allez dans **Settings** → **Sender Authentication**
2. Choisissez **Authenticate Your Domain**
3. Suivez les étapes pour configurer les enregistrements DNS
4. Une fois vérifié, vous pouvez utiliser n'importe quel email de ce domaine

### 4. Configurer les variables d'environnement

Ajoutez dans Render (backend) :
```bash
SENDGRID_API_KEY=SG.votre_cle_ici
SENDGRID_FROM_EMAIL=noreply@votredomaine.com
SENDGRID_FROM_NAME=Altus Group
```

---

## 🚀 Déployer le Backend sur Render

### 1. Préparer le dépôt

Assurez-vous que votre code est sur GitHub, GitLab ou Bitbucket.

### 2. Créer un nouveau Web Service

1. Allez sur https://dashboard.render.com
2. Cliquez sur **New +** → **Web Service**
3. Connectez votre dépôt Git
4. Configuration :
   - **Name** : `altus-group-backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm run start`
   - **Plan** : Choisissez selon vos besoins (Gratuit disponible)

### 3. Variables d'environnement

Ajoutez toutes les variables listées dans la section "Backend" ci-dessus.

### 4. Déployer

- Cliquez sur **Create Web Service**
- Render va automatiquement :
  1. Installer les dépendances
  2. Builder votre application
  3. Démarrer le serveur
  4. Initialiser la base de données

### 5. Noter l'URL

Une fois déployé, notez l'URL de votre backend (ex: `https://altus-group-backend.onrender.com`)

---

## 🌐 Déployer le Frontend sur Vercel

### 1. Préparer le dépôt

Le même dépôt peut être utilisé (Vercel détectera le client automatiquement).

### 2. Importer le projet

1. Allez sur https://vercel.com
2. Cliquez sur **Add New...** → **Project**
3. Importez votre dépôt
4. Configuration :
   - **Framework Preset** : Vite
   - **Root Directory** : `./client` (si votre structure est monorepo)
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

### 3. Variables d'environnement (optionnelles)

Si nécessaire, ajoutez des variables préfixées par `VITE_` pour qu'elles soient accessibles dans le frontend.

### 4. Déployer

- Cliquez sur **Deploy**
- Vercel va automatiquement déployer votre application
- Chaque push sur la branche principale redéploiera automatiquement

---

## 🔗 Connecter Frontend et Backend

### Dans le Frontend

Mettez à jour l'URL de l'API dans votre code :

**Option 1** : Variable d'environnement (recommandé)
```typescript
// client/src/lib/queryClient.ts
const API_URL = import.meta.env.VITE_API_URL || 'https://altus-group-backend.onrender.com';

export async function apiRequest(method: string, url: string, data?: unknown) {
  const fullUrl = `${API_URL}${url}`;
  // ... reste du code
}
```

**Option 2** : Configuration directe (plus simple pour démarrer)
Si votre backend et frontend sont sur des domaines différents, assurez-vous que le backend accepte les requêtes CORS depuis Vercel.

### Dans le Backend

Ajoutez la configuration CORS dans `server/index.ts` :

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:5173', // Développement
    'https://votre-app.vercel.app', // Production
  ],
  credentials: true, // Important pour les sessions
}));
```

---

## ✅ Checklist de Déploiement

### Backend (Render)

- [ ] Base de données PostgreSQL créée
- [ ] `DATABASE_URL` configurée
- [ ] `SESSION_SECRET` générée et ajoutée
- [ ] Compte SendGrid créé
- [ ] `SENDGRID_API_KEY` ajoutée
- [ ] Email expéditeur vérifié
- [ ] `NODE_ENV=production` configuré
- [ ] Service déployé et fonctionne
- [ ] URL du backend notée

### Frontend (Vercel)

- [ ] Projet importé sur Vercel
- [ ] Build réussi
- [ ] URL du frontend notée
- [ ] Application accessible publiquement

### Tests Post-Déploiement

- [ ] S'inscrire avec un vrai email
- [ ] Recevoir l'email de vérification
- [ ] Vérifier l'email via le lien
- [ ] Recevoir l'email de bienvenue
- [ ] Se connecter avec les identifiants
- [ ] Naviguer dans le dashboard
- [ ] Créer un prêt de test
- [ ] Tester un transfert

---

## 🔧 Dépannage

### Les emails ne sont pas envoyés

1. Vérifiez que `SENDGRID_API_KEY` est correcte
2. Vérifiez que l'email expéditeur est vérifié dans SendGrid
3. Consultez les logs dans SendGrid : **Activity Feed**
4. Vérifiez les logs de votre backend sur Render

### Erreur de base de données

1. Vérifiez que `DATABASE_URL` est correcte
2. Testez la connexion à la base depuis Render
3. Assurez-vous que `npm run db:push` a été exécuté
4. Consultez les logs du backend

### Session/Cookie ne fonctionne pas

1. Assurez-vous que CORS est bien configuré avec `credentials: true`
2. Vérifiez que `SESSION_SECRET` est défini
3. En production, les cookies nécessitent HTTPS (ce qui est le cas avec Render et Vercel)

### Frontend ne se connecte pas au backend

1. Vérifiez l'URL du backend dans le code frontend
2. Testez le backend directement via l'URL (ex: `https://votre-backend.onrender.com/api/user`)
3. Vérifiez la configuration CORS
4. Consultez la console du navigateur pour les erreurs

---

## 📚 Ressources Utiles

- **Render Docs** : https://render.com/docs
- **Vercel Docs** : https://vercel.com/docs
- **SendGrid Docs** : https://docs.sendgrid.com
- **Neon Docs** : https://neon.tech/docs
- **Drizzle ORM** : https://orm.drizzle.team/docs

---

## 🎯 Première Utilisation de PostgreSQL

Si c'est votre première fois avec PostgreSQL, voici ce que vous devez savoir :

### Concepts de Base

1. **PostgreSQL** est une base de données relationnelle (SQL)
2. Les données sont stockées dans des **tables** avec des **colonnes** et des **lignes**
3. Contrairement au stockage en mémoire, les données persistent même si le serveur redémarre

### Drizzle ORM

Ce projet utilise **Drizzle ORM** pour interagir avec PostgreSQL :

- **Schéma** : Défini dans `shared/schema.ts`
- **Migrations** : Utilisez `npm run db:push` pour synchroniser le schéma
- **Queries** : Le code utilise Drizzle pour lire/écrire les données

### Commandes Utiles

```bash
# Pousser le schéma vers la DB (créer/modifier tables)
npm run db:push

# Voir le schéma actuel
npm run db:studio

# Générer des migrations (optionnel, db:push suffit généralement)
npm run db:generate
```

### Accéder à la Base de Données

**Avec Render PostgreSQL** :
- Utilisez l'onglet "Shell" dans le dashboard
- Ou connectez-vous via `psql` avec l'External Database URL

**Avec Neon** :
- Utilisez leur interface SQL Editor dans le dashboard

### Sauvegardes

- **Render** : Sauvegardes automatiques quotidiennes (plan payant)
- **Neon** : Sauvegardes automatiques incluses
- **Manuel** : Utilisez `pg_dump` pour exporter vos données

---

## 🎉 Félicitations !

Une fois tout configuré, votre application Altus Group sera :
- ✅ Déployée en production
- ✅ Accessible publiquement
- ✅ Avec authentification sécurisée
- ✅ Emails fonctionnels
- ✅ Base de données persistante

Si vous rencontrez des problèmes, consultez les logs de Render et Vercel, et n'hésitez pas à revenir vers moi !
