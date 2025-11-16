# Guide de Déploiement - Altus Finance Group

## 📋 Vue d'ensemble

Ce guide vous explique comment déployer votre application en production avec :
- **Frontend** : Vercel → `altusfinancesgroup.com` (déjà configuré ✓)
- **Backend** : Render → `api.altusfinancesgroup.com`
- **Base de données** : PostgreSQL (Render PostgreSQL ou Neon)
- **Emails** : SendGrid
- **Architecture** : Frontend/Backend séparés avec communication sécurisée via CORS

---

## 🔐 Variables d'Environnement Requises

### Backend (Render)

Créez ces variables d'environnement dans votre projet Render :

```bash
# Base de données PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/database_name

# Session (OBLIGATOIRE - Générez une clé secrète forte avec: openssl rand -base64 32)
SESSION_SECRET=votre_cle_secrete_forte_et_aleatoire_32_caracteres_minimum

# Cookie configuration (IMPORTANT pour le domaine personnalisé)
COOKIE_DOMAIN=.altusfinancesgroup.com

# SendGrid pour les emails
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@altusfinancesgroup.com
SENDGRID_FROM_NAME=Altus Finance Group

# Environnement
NODE_ENV=production

# URL du frontend (pour CORS et liens dans les emails)
FRONTEND_URL=https://altusfinancesgroup.com

# Port (Render le configure automatiquement)
PORT=5000
```

⚠️ **IMPORTANT** : 
- `COOKIE_DOMAIN` doit commencer par un point (`.altusfinancesgroup.com`) pour fonctionner avec les sous-domaines
- `SESSION_SECRET` doit être une chaîne aléatoire forte (minimum 32 caractères)

### Frontend (Vercel)

Créez ces variables d'environnement dans **Vercel → Project Settings → Environment Variables** :

```bash
# URL du backend API (OBLIGATOIRE)
VITE_API_URL=https://api.altusfinancesgroup.com

# URL du site pour SEO et Open Graph (RECOMMANDÉ)
VITE_SITE_URL=https://altusfinancesgroup.com

# Nom de l'application
VITE_APP_NAME=Altus Finance Group
```

⚠️ **IMPORTANT** : 
- Ces variables doivent être préfixées par `VITE_` pour être accessibles dans le code frontend
- Après avoir ajouté/modifié ces variables, redéployez votre application sur Vercel

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

## 🌐 Configuration DNS pour le domaine personnalisé

Votre domaine `altusfinancesgroup.com` est déjà configuré sur Vercel pour le frontend. Vous devez maintenant ajouter le sous-domaine API.

### Configuration DNS chez Vercel

1. **Accédez à votre projet Vercel**
   - Dashboard → Votre projet → **Settings** → **Domains**

2. **Ajoutez le sous-domaine API**
   - Dans la section DNS ou Domains, ajoutez un enregistrement **CNAME** :
     ```
     Type: CNAME
     Name: api
     Value: [votre-service].onrender.com (vous l'obtiendrez après avoir créé le service Render)
     TTL: Auto ou 3600
     ```

3. **Vérification de la configuration actuelle**
   - `altusfinancesgroup.com` → Vercel (Frontend) ✓
   - `www.altusfinancesgroup.com` → Vercel (Frontend) ✓
   - `api.altusfinancesgroup.com` → Render (Backend) ← À configurer

---

## 🚀 Déployer le Backend sur Render

### 1. Préparer le dépôt

Assurez-vous que votre code est sur GitHub, GitLab ou Bitbucket.

### 2. Créer un nouveau Web Service

1. Allez sur https://dashboard.render.com
2. Cliquez sur **New +** → **Web Service**
3. Connectez votre dépôt Git
4. Configuration :
   - **Name** : `altus-finance-backend`
   - **Region** : Frankfurt (EU) ou Oregon (US West) selon votre audience
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : **Starter ($7/mois)** recommandé pour éviter le "cold start" du plan gratuit
   
   ⚠️ **Note sur le plan gratuit** : Les services gratuits Render s'endorment après 15 minutes d'inactivité et prennent ~30 secondes à redémarrer. Pour une application de production, le plan Starter est recommandé.

   ⚠️ **IMPORTANT - Build Command** : Utilisez **uniquement** `npm install`. N'utilisez PAS `npm run build` car votre application utilise maintenant `tsx` directement en production (pas de compilation nécessaire).

### 3. Variables d'environnement

Ajoutez toutes les variables listées dans la section "Backend" ci-dessus.

### 4. Déployer

- Cliquez sur **Create Web Service**
- Render va automatiquement :
  1. Installer les dépendances
  2. Builder votre application
  3. Démarrer le serveur
  4. Initialiser la base de données

### 5. Configurer le domaine personnalisé

1. **Dans le dashboard de votre service Render** :
   - Allez dans **Settings** → **Custom Domains**
   - Cliquez sur **Add Custom Domain**
   - Entrez : `api.altusfinancesgroup.com`
   - Render va vérifier et vous indiquer si la configuration DNS est correcte

2. **Retournez sur Vercel pour configurer le DNS** :
   - Ajoutez l'enregistrement CNAME (voir section DNS ci-dessus)
   - Utilisez la valeur fournie par Render (ex: `altus-finance-backend.onrender.com`)

3. **Vérification SSL** :
   - Une fois le domaine vérifié, Render provisionne automatiquement un certificat SSL
   - Cela peut prendre quelques minutes
   - Votre API sera accessible via `https://api.altusfinancesgroup.com`

### 6. Noter les URLs

Une fois déployé :
- **URL Render** : `https://altus-finance-backend.onrender.com` (utilisable mais pas jolie)
- **URL personnalisée** : `https://api.altusfinancesgroup.com` (recommandé pour production)

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

## 🔒 Configuration CORS (Déjà intégrée)

Votre backend a déjà une configuration CORS sécurisée intégrée dans `server/index.ts`. Voici ce qui est automatiquement géré :

### En Production
Le backend accepte uniquement les requêtes provenant de :
- `https://altusfinancesgroup.com`
- `https://www.altusfinancesgroup.com`
- La valeur de `FRONTEND_URL` (variable d'environnement)

### Cookies et Sessions
- **Cookies sécurisés** : `secure: true` (HTTPS obligatoire)
- **HttpOnly** : Protection contre XSS
- **SameSite** : `none` (permet la communication cross-domain)
- **Domain** : `.altusfinancesgroup.com` (partage entre domaines)
- **Credentials** : `true` (autorise l'envoi de cookies)

⚠️ **Aucune modification nécessaire** - Le code détecte automatiquement l'environnement et applique la bonne configuration !

---

## ✅ Checklist de Déploiement

### Préparation
- [ ] Code poussé sur GitHub/GitLab
- [ ] Compte Render créé
- [ ] Compte SendGrid créé (ou configuration email)
- [ ] Domaine `altusfinancesgroup.com` déjà sur Vercel ✓

### Backend (Render)

**Création du service :**
- [ ] Service web créé sur Render
- [ ] Dépôt Git connecté
- [ ] Build Command : `npm install`
- [ ] Start Command : `npm start`

**Base de données :**
- [ ] PostgreSQL créée sur Render (ou Neon)
- [ ] `DATABASE_URL` copiée et configurée

**Variables d'environnement :**
- [ ] `NODE_ENV=production`
- [ ] `SESSION_SECRET` générée (`openssl rand -base64 32`)
- [ ] `COOKIE_DOMAIN=.altusfinancesgroup.com`
- [ ] `FRONTEND_URL=https://altusfinancesgroup.com`
- [ ] `SENDGRID_API_KEY` configurée
- [ ] `SENDGRID_FROM_EMAIL` configurée
- [ ] `DATABASE_URL` configurée

**Domaine personnalisé :**
- [ ] Domaine `api.altusfinancesgroup.com` ajouté dans Render
- [ ] Enregistrement CNAME configuré chez Vercel
- [ ] Certificat SSL provisionné par Render
- [ ] API accessible via `https://api.altusfinancesgroup.com`

### Frontend (Vercel)

**Configuration (si pas déjà fait) :**
- [ ] Projet importé sur Vercel
- [ ] Framework : Vite détecté
- [ ] Build réussi

**Variables d'environnement :**
- [ ] `VITE_API_URL=https://api.altusfinancesgroup.com`
- [ ] `VITE_SITE_URL=https://altusfinancesgroup.com`
- [ ] Application redéployée après ajout des variables

**Domaine :**
- [ ] `altusfinancesgroup.com` configuré ✓
- [ ] `www.altusfinancesgroup.com` configuré ✓
- [ ] SSL actif ✓

### Tests Post-Déploiement

**Test 1 : Santé du backend**
- [ ] Accéder à `https://api.altusfinancesgroup.com/health`
- [ ] Vérifier réponse JSON avec `status: "ok"`
- [ ] Vérifier `database: "connected"`
- [ ] Vérifier CORS configuration

**Test 2 : Frontend accessible**
- [ ] Accéder à `https://altusfinancesgroup.com`
- [ ] Page se charge correctement
- [ ] Pas d'erreur dans la console du navigateur

**Test 3 : Communication Frontend ↔ Backend**
- [ ] Ouvrir DevTools → Console
- [ ] Exécuter : `fetch('https://api.altusfinancesgroup.com/health', {credentials: 'include'}).then(r => r.json()).then(console.log)`
- [ ] Vérifier qu'il n'y a pas d'erreur CORS
- [ ] Réponse reçue avec succès

**Test 4 : Authentification complète**
- [ ] S'inscrire avec un vrai email
- [ ] Recevoir l'email de vérification
- [ ] Cliquer sur le lien de vérification
- [ ] Recevoir l'email de bienvenue
- [ ] Se connecter avec les identifiants

**Test 5 : Sessions et cookies**
- [ ] Après connexion, ouvrir DevTools → Application → Cookies
- [ ] Vérifier cookie `sessionId` présent
- [ ] Domain : `.altusfinancesgroup.com`
- [ ] Secure : `✓`
- [ ] HttpOnly : `✓`
- [ ] SameSite : `None`

**Test 6 : Fonctionnalités métier**
- [ ] Naviguer dans le dashboard
- [ ] Créer un prêt de test
- [ ] Effectuer un transfert
- [ ] Vérifier que les données sont persistées (rafraîchir la page)

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
