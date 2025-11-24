# 🔍 DIAGNOSTIC PROBLÈME VERCEL - Chat 404 Errors

## Symptômes
- Les variables d'environnement sont configurées sur Vercel ✅
- Le code sur GitHub contient les corrections avec `getApiUrl()` ✅
- Le redéploiement a été fait ✅
- **MAIS** les erreurs 404 persistent dans la console F12 ❌
- Les URLs appelées sont `https://altusfinancesgroup.com/api/chat/...` au lieu de `https://api.altusfinancesgroup.com/api/chat/...`

## Causes possibles

### 1. Vercel déploie depuis une mauvaise branche
**Vérification:**
1. Sur Vercel → Settings → Git
2. Vérifier que "Production Branch" = `main`
3. Si c'est une autre branche (master, production, etc.), la changer

### 2. Le build cache est trop agressif
**Solution:**
1. Sur Vercel → Settings → General
2. Chercher "Build & Development Settings"
3. Trouver l'option pour **désactiver le cache de build**
4. Ou dans le dernier déploiement → Redeploy → **Décocher** "Use existing Build Cache"

### 3. Le fichier buildé ne contient pas les variables
**Vérification:**
1. Après le déploiement, aller sur https://altusfinancesgroup.com
2. Ouvrir la console F12 → Sources
3. Chercher dans les fichiers JS pour "api.altusfinancesgroup.com"
4. Si absent → Les variables ne sont pas incluses dans le build

### 4. Conflit avec vercel.json ou configuration de build
**Vérification:**
Vérifier s'il y a un fichier `vercel.json` à la racine du projet qui pourrait interférer

### 5. Framework Preset incorrect
**Vérification:**
1. Sur Vercel → Settings → Build & Development Settings
2. Framework Preset doit être: **Vite**
3. Build Command doit être: `npm run build` ou `vite build`
4. Output Directory doit être: `dist` ou `dist/client`
5. Install Command doit être: `npm install`

## ✅ Actions à faire MAINTENANT

### Étape 1: Vérifier la branche de déploiement
```
Vercel Dashboard → Votre projet → Settings → Git
Vérifier: Production Branch = main
```

### Étape 2: Faire un redéploiement SANS cache
```
Vercel Dashboard → Deployments → Dernier déploiement
Cliquer sur (...) → Redeploy
DÉCOCHER "Use existing Build Cache"
Cliquer "Redeploy"
```

### Étape 3: Vérifier que les variables sont injectées
Après le build, dans les logs de build Vercel, vous devriez voir:
```
Environment Variables:
✓ VITE_API_URL
✓ VITE_SOCKET_URL  
✓ VITE_SITE_URL
```

### Étape 4: Vérifier le code source buildé
1. Une fois déployé, aller sur https://altusfinancesgroup.com
2. F12 → Sources → Chercher "api.altusfinancesgroup.com"
3. Si présent ✅ = Variables injectées
4. Si absent ❌ = Problème de build

## 🚨 Si rien ne fonctionne

### Option A: Supprimer et recréer le projet Vercel
1. Settings → General → Delete Project
2. Importer à nouveau depuis GitHub
3. Configurer les variables d'environnement
4. Déployer

### Option B: Vérifier les logs de build complets
1. Deployments → Dernier déploiement → View Build Logs
2. Chercher des erreurs liées à:
   - Installation des packages
   - Build Vite
   - Variables d'environnement

### Option C: Build local pour tester
```bash
# Dans Replit
export VITE_API_URL=https://api.altusfinancesgroup.com
export VITE_SOCKET_URL=https://api.altusfinancesgroup.com
export VITE_SITE_URL=https://altusfinancesgroup.com
npm run build

# Vérifier que dist/client contient les bonnes URLs
grep -r "api.altusfinancesgroup.com" dist/
```

## 📋 Checklist de vérification Vercel

- [ ] Production Branch = `main` (pas master ou autre)
- [ ] Framework Preset = Vite
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist` ou `dist/client`
- [ ] Variables VITE_API_URL, VITE_SOCKET_URL, VITE_SITE_URL définies
- [ ] Redéploiement sans cache effectué
- [ ] Logs de build montrent les variables
- [ ] Code source buildé contient "api.altusfinancesgroup.com"
- [ ] Cache navigateur vidé (Ctrl+Shift+R)

## 💡 Astuce Rapide

Si vous avez accès aux logs de build Vercel, cherchez cette ligne:
```
Creating an optimized production build...
```

Juste après, vous devriez voir les variables d'environnement listées. Si elles n'apparaissent pas, c'est que Vercel ne les voit pas pendant le build.
