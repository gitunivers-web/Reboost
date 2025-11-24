# 🔧 Configuration Vercel - CORRECTION DU PROBLÈME DES VARIABLES

## 🎯 Problème Identifié

Vercel définit les variables d'environnement dans `process.env` mais **ne crée pas de fichier `.env`**.
Vite a besoin d'un fichier `.env` physique pour injecter les variables `VITE_*` dans le build.

**Résultat** : Les variables existent sur Vercel mais ne sont pas injectées dans le bundle → `undefined` dans le navigateur.

---

## ✅ Solution Appliquée

Un script `vercel-build.sh` a été créé qui :
1. Génère un fichier `.env` à partir des variables Vercel
2. Lance le build Vite avec ces variables

---

## 📋 Configuration à Faire sur Vercel

### Étape 1 : Aller dans les Settings du Projet

1. Allez sur **Vercel Dashboard** → Votre projet
2. Cliquez sur **Settings**
3. Allez dans **Build & Development Settings**

### Étape 2 : Modifier les Commandes de Build

Remplacez les valeurs actuelles par :

**Build Command:**
```bash
npm run vercel-build
```

**Output Directory:**
```
dist/public
```

**Install Command:**
```bash
npm install
```

**Development Command:** (laisser vide ou mettre)
```bash
npm run dev
```

### Étape 3 : Framework Preset

Sélectionnez : **Other** (ou laissez sur Vite si déjà configuré)

### Étape 4 : Root Directory

Laissez vide (`.` par défaut)

### Étape 5 : Sauvegarder

Cliquez sur **Save** en bas de la page

---

## 🚀 Redéployer

Après avoir changé la Build Command :

**Option A** (Recommandée) :
- Allez dans **Deployments**
- Cliquez sur **⋯** (3 points) du dernier déploiement
- Cliquez **"Redeploy"**

**Option B** :
- Faites un commit et push :
```bash
git add .
git commit -m "Fix: Add Vercel build script for env vars"
git push
```

---

## 🔍 Vérification du Build

Dans les nouveaux logs de build Vercel, vous devriez voir :

```
🔧 Création du fichier .env pour Vite...
✅ Fichier .env créé avec succès:
VITE_API_URL=https://api.altusfinancesgroup.com
VITE_SOCKET_URL=https://api.altusfinancesgroup.com
VITE_SITE_URL=https://altusfinancesgroup.com

📦 Lancement du build frontend...
vite v5.4.21 building for production...
✓ 4061 modules transformed.
```

---

## ✅ Test Final

Après le redéploiement :

1. **Page de diagnostic** : `https://altusfinancesgroup.com/diagnostic`
   - ✅ Doit afficher "VITE_API_URL est correctement configurée"

2. **Console navigateur** : (F12 → Console)
   ```javascript
   console.log(import.meta.env.VITE_API_URL);
   // Doit afficher: https://api.altusfinancesgroup.com
   ```

3. **Onglet Network** : (F12 → Network)
   - Les appels API doivent aller vers `api.altusfinancesgroup.com`
   - Plus de 404 sur `/api/...`

4. **Chat fonctionnel** :
   - Le WebSocket doit se connecter
   - Les messages doivent s'envoyer correctement

---

## 🎯 Résumé

**Avant** :
- Variables configurées sur Vercel ✅
- Mais pas injectées dans le build ❌
- `import.meta.env.VITE_API_URL` = `undefined` ❌

**Après** :
- Script génère `.env` avant le build ✅
- Variables injectées dans le bundle ✅
- `import.meta.env.VITE_API_URL` = `https://api.altusfinancesgroup.com` ✅

---

## 📞 Si Problème Persiste

1. Vérifiez les logs de build Vercel pour voir le contenu du `.env`
2. Vérifiez que la Build Command est bien `npm run vercel-build`
3. Vérifiez que les 3 variables `VITE_*` existent toujours dans Environment Variables
4. Contactez-moi avec les nouveaux logs de build

---

**C'est prêt !** Maintenant configurez la Build Command sur Vercel et redéployez. 🚀
