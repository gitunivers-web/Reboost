# 🔍 Solution : Chat Ne Fonctionne Pas en Production

## 📋 Problème Identifié

D'après vos captures d'écran, le frontend en production appelle :
- ❌ `https://altusfinancesgroup.com/api/chat/conversations` (INCORRECT)
- ✅ Devrait appeler : `https://api.altusfinancesgroup.com/api/chat/conversations`

**Résultat** : Erreurs 404 NOT_FOUND car Vercel (frontend) ne sert pas d'API backend.

## 🎯 Cause Racine

Le code frontend utilise `import.meta.env.VITE_API_URL` pour construire les URLs API. Si cette variable est vide ou non définie, les appels API deviennent **relatifs** au domaine actuel.

```typescript
// Dans client/src/lib/queryClient.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '';  // ⚠️ Si vide = ''

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;  // Si API_BASE_URL = '', retourne juste le path
}
```

Si `VITE_API_URL` = `""` (vide), alors :
- `getApiUrl('/api/chat/conversations')` → `'/api/chat/conversations'`
- URL finale → `https://altusfinancesgroup.com/api/chat/conversations` ❌

Si `VITE_API_URL` = `"https://api.altusfinancesgroup.com"`, alors :
- `getApiUrl('/api/chat/conversations')` → `'https://api.altusfinancesgroup.com/api/chat/conversations'`
- URL finale → `https://api.altusfinancesgroup.com/api/chat/conversations` ✅

## ✅ Solution : Forcer un Redéploiement Propre sur Vercel

Même si vous avez configuré les variables il y a longtemps, **le build actuel de production ne les utilise peut-être pas**. Voici comment garantir que les variables sont correctement injectées :

### Étape 1 : Vérifier les Variables d'Environnement sur Vercel

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet **altusfinancesgroup.com**
3. Allez dans **Settings** → **Environment Variables**
4. Vérifiez que ces 3 variables existent ET sont cochées pour **"Production"** :

```
VITE_API_URL=https://api.altusfinancesgroup.com
VITE_SITE_URL=https://altusfinancesgroup.com
VITE_SOCKET_URL=https://api.altusfinancesgroup.com
```

⚠️ **IMPORTANT** : 
- Pas de slash `/` à la fin des URLs
- L'environnement **"Production"** doit être coché (pas seulement Preview)
- Les noms doivent commencer par `VITE_` exactement

### Étape 2 : Vider le Cache de Build et Redéployer

Vercel peut parfois utiliser un cache qui ne contient pas les bonnes variables. Voici comment forcer un build frais :

#### Option A : Via l'Interface Vercel (Recommandé)

1. Allez dans **Deployments**
2. Trouvez le dernier déploiement en production (marqué avec une coche verte)
3. Cliquez sur les **trois points (...)** à droite
4. Sélectionnez **"Redeploy"**
5. ⚠️ **DÉCOCHEZ** "Use existing Build Cache" (important !)
6. Cliquez sur **"Redeploy"**

#### Option B : Via Git (Alternative)

```bash
# Dans votre terminal local
git commit --allow-empty -m "Force rebuild with env vars"
git push
```

### Étape 3 : Attendre la Fin du Build

Le build prend généralement 1-3 minutes. Attendez que le statut passe à **"Ready"** (vert) avant de tester.

### Étape 4 : Vérifier Que les Variables Sont Bien Injectées

Une fois le déploiement terminé :

1. Ouvrez https://altusfinancesgroup.com
2. Ouvrez la Console du Navigateur (F12 → Console)
3. Tapez et exécutez :

```javascript
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_SITE_URL:', import.meta.env.VITE_SITE_URL);
console.log('VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
```

**Résultat Attendu ✅** :
```
VITE_API_URL: https://api.altusfinancesgroup.com
VITE_SITE_URL: https://altusfinancesgroup.com
VITE_SOCKET_URL: https://api.altusfinancesgroup.com
```

**Si vous obtenez `undefined` ❌**, les variables ne sont pas correctement configurées.

### Étape 5 : Tester le Chat

1. Connectez-vous sur https://altusfinancesgroup.com
2. Allez sur la page du chat (Support ALTUS ou Chat natif)
3. Ouvrez la Console (F12) → Onglet **Network**
4. Envoyez un message
5. Vérifiez les requêtes réseau :

**Vous devriez voir** :
- ✅ `POST https://api.altusfinancesgroup.com/api/chat/conversations` → Statut 200 ou 201
- ✅ `GET https://api.altusfinancesgroup.com/api/chat/conversations` → Statut 200

**Au lieu de** :
- ❌ `POST https://altusfinancesgroup.com/api/chat/conversations` → Statut 404

## 🔧 Solution Alternative : Vérifier la Configuration du Build Vercel

Si le problème persiste, vérifiez la configuration du projet :

### Dans Settings → General → Build & Development Settings

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: (vide) OU client si votre code est dans client/
```

### Si Votre Structure Est :

```
/
├── client/          ← Frontend ici
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── server/          ← Backend (pas utilisé par Vercel)
```

Alors configurez :
- **Root Directory** : `client`

OU modifiez :
- **Build Command** : `cd client && npm install && npm run build`
- **Output Directory** : `client/dist`

## 📊 Utiliser la Page de Diagnostic

J'ai vu que votre application a une page de diagnostic. Accédez à :

```
https://altusfinancesgroup.com/diagnostic
```

Cette page affichera :
- Les variables d'environnement détectées
- L'URL de l'API utilisée
- Des tests de connectivité

Cela vous aidera à confirmer que les variables sont correctement chargées.

## 🎯 Checklist de Vérification Complète

### Sur Vercel Dashboard

- [ ] `VITE_API_URL=https://api.altusfinancesgroup.com` configurée pour **Production**
- [ ] `VITE_SOCKET_URL=https://api.altusfinancesgroup.com` configurée pour **Production**
- [ ] `VITE_SITE_URL=https://altusfinancesgroup.com` configurée pour **Production**
- [ ] Pas de slash `/` à la fin des URLs
- [ ] Variables commencent par `VITE_` exactement

### Redéploiement

- [ ] Cache de build vidé (option "Use existing Build Cache" décochée)
- [ ] Nouveau déploiement lancé
- [ ] Build terminé avec succès (statut "Ready")
- [ ] Aucune erreur dans les Build Logs

### Tests en Production

- [ ] `import.meta.env.VITE_API_URL` retourne la bonne URL dans la console
- [ ] Page `/diagnostic` affiche les bonnes variables
- [ ] Requêtes réseau vont vers `api.altusfinancesgroup.com`
- [ ] Chat fonctionne sans erreurs 404
- [ ] Messages s'envoient et se reçoivent correctement

## 🆘 Si le Problème Persiste Encore

### 1. Vérifier qu'il N'y a PAS de Fichier `.env` ou `.env.production` Commité

Ces fichiers peuvent surcharger les variables Vercel :

```bash
# Dans votre dépôt Git, vérifiez
git ls-files | grep .env
```

**Si vous voyez** `.env`, `.env.production`, ou `.env.local` :
- ❌ Supprimez-les du dépôt
- Ajoutez-les au `.gitignore`
- Recommitez et poussez

### 2. Vider le Cache CDN de Vercel

1. Settings → Deployment Protection
2. Si vous voyez une option de cache, videz-le
3. Redéployez

### 3. Vérifier les Logs de Build Vercel

1. Deployments → Dernier déploiement
2. Cliquez sur "Building"
3. Cherchez des warnings liés aux variables d'environnement

Vous devriez voir quelque chose comme :
```
✓ 3 environment variables available
```

### 4. Tester Avec Un Domaine Preview

Créez une nouvelle branche et testez sur un domaine de preview Vercel :

```bash
git checkout -b test-env-vars
git push origin test-env-vars
```

Vercel créera automatiquement un domaine de preview (ex: `test-env-vars-altus.vercel.app`). Testez si le chat fonctionne là-bas.

Si ça fonctionne sur Preview mais pas sur Production, c'est un problème de cache de production.

## 📸 Preuve de Bon Fonctionnement

Une fois tout configuré correctement :

### Dans la Console Navigateur (F12 → Console)
```javascript
// ✅ Devrait afficher l'URL du backend
console.log(import.meta.env.VITE_API_URL); 
// → https://api.altusfinancesgroup.com
```

### Dans l'Onglet Network (F12 → Network)
Quand vous utilisez le chat :
- ✅ `GET https://api.altusfinancesgroup.com/api/chat/conversations` → 200
- ✅ `POST https://api.altusfinancesgroup.com/api/chat/messages` → 201
- ✅ Connexion WebSocket vers `wss://api.altusfinancesgroup.com`

**Plus aucune requête vers** `altusfinancesgroup.com/api/*` ❌

## 🎉 Résultat Final Attendu

- ✅ Chat natif fonctionne en production
- ✅ Messages s'envoient et s'affichent correctement
- ✅ Conversations se chargent
- ✅ Notifications en temps réel fonctionnent (WebSocket)
- ✅ Aucune erreur 404 dans la console

---

**Temps estimé pour la correction** : 5-10 minutes
**Dernière mise à jour** : 24 novembre 2025
