# 🚀 Guide de Déploiement Production - Altus Finances Group

## ✅ État du Code : PRÊT POUR LA PRODUCTION

Votre code est **déjà correctement configuré** pour un déploiement séparé Vercel + Render.
Pas besoin de modifications de code !

---

## 📋 Variables d'Environnement à Configurer

### 🟢 Backend (Render)

Allez sur [Render Dashboard](https://dashboard.render.com) → Votre service → **Environment**

```bash
# DATABASE - OBLIGATOIRE
DATABASE_URL=postgresql://user:password@host:5432/database

# SESSION - OBLIGATOIRE
SESSION_SECRET=<générez avec: openssl rand -base64 32>

# FRONTEND - OBLIGATOIRE pour CORS
FRONTEND_URL=https://altusfinancesgroup.com

# COOKIE - IMPORTANT pour sessions cross-domain
COOKIE_DOMAIN=.altusfinancesgroup.com

# ENVIRONMENT
NODE_ENV=production

# SENDGRID (si vous utilisez les emails)
SENDGRID_API_KEY=votre_clé_sendgrid

# CLOUDINARY (si vous utilisez upload fichiers)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# ADMIN (optionnel)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=votre_mot_de_passe_admin
```

### 🔵 Frontend (Vercel)

Allez sur [Vercel Dashboard](https://vercel.com/dashboard) → Votre projet → **Settings** → **Environment Variables**

```bash
# API - OBLIGATOIRE
VITE_API_URL=https://api.altusfinancesgroup.com

# SOCKET - OBLIGATOIRE pour chat
VITE_SOCKET_URL=https://api.altusfinancesgroup.com

# SITE - OBLIGATOIRE pour SEO
VITE_SITE_URL=https://altusfinancesgroup.com
```

**⚠️ IMPORTANT :** Après avoir ajouté les variables sur Vercel, cliquez sur **"Redeploy"** pour reconstruire avec les nouvelles variables.

---

## 🌐 Configuration DNS

Vérifiez que vos enregistrements DNS pointent vers les bons services :

```
Type    Name    Value                           TTL
A       @       76.76.21.21 (Vercel IP)        Auto
CNAME   www     cname.vercel-dns.com.          Auto
CNAME   api     <votre-app>.onrender.com       Auto
```

---

## 🧪 Tests de Vérification

### 1. Test Backend Santé

```bash
curl -I https://api.altusfinancesgroup.com/api/health
```

**Attendu :** HTTP 200 avec JSON `{"status":"ok"}`

### 2. Test CORS Headers

```bash
curl -I -H "Origin: https://altusfinancesgroup.com" \
  https://api.altusfinancesgroup.com/api/notifications
```

**Attendu :**
```
Access-Control-Allow-Origin: https://altusfinancesgroup.com
Access-Control-Allow-Credentials: true
```

### 3. Test Route API

```bash
curl -v -X POST 'https://api.altusfinancesgroup.com/api/chat/conversations' \
  -H 'Content-Type: application/json' \
  --data '{}'
```

**Attendu :** Réponse JSON (pas HTML 404)

### 4. Test WebSocket (dans Console Navigateur)

Ouvrez la console sur `https://altusfinancesgroup.com` et tapez :

```javascript
// Test connexion Socket.IO
const testSocket = io('https://api.altusfinancesgroup.com', {
  path: '/socket.io',
  withCredentials: true,
  transports: ['websocket', 'polling']
});

testSocket.on('connect', () => console.log('✅ Socket connecté:', testSocket.id));
testSocket.on('connect_error', (err) => console.error('❌ Erreur:', err.message));
```

**Attendu :** Message `✅ Socket connecté`

---

## 🔍 Diagnostic des Erreurs Courantes

### Erreur 404 sur `/api/...`

**Cause :** Frontend appelle le mauvais domaine

**Solution :**
1. Vérifiez que `VITE_API_URL` est définie sur Vercel
2. Redéployez le frontend après avoir ajouté la variable
3. Vérifiez dans la console navigateur : 
   ```javascript
   console.log('API URL:', import.meta.env.VITE_API_URL);
   ```

### Erreur CORS

**Cause :** Backend n'autorise pas le frontend

**Solution :**
1. Vérifiez que `FRONTEND_URL` est définie sur Render
2. Vérifiez les logs backend pour voir les origins rejetées
3. Backend doit afficher au démarrage :
   ```
   [CONFIG] CORS Allowed Origins: production domains
   ```

### Erreur 502 Bad Gateway

**Cause :** Backend Render ne répond pas

**Solution :**
1. Vérifiez que le backend est démarré sur Render
2. Vérifiez les logs Render pour voir les erreurs
3. Vérifiez que le `PORT` est bien configuré (Render l'injecte automatiquement)

### Socket : Invalid HTTP Upgrade

**Cause :** Problème de configuration Socket.IO

**Solution :**
1. Vérifiez que `VITE_SOCKET_URL` pointe vers `https://api.altusfinancesgroup.com`
2. Vérifiez que le backend expose bien Socket.IO sur `/socket.io`
3. Vérifiez que Render autorise les connexions WebSocket (par défaut OK)

---

## 📊 Checklist Complète de Déploiement

### Backend (Render)

- [ ] Service Web créé sur Render
- [ ] Repository GitHub connecté
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm run start`
- [ ] Toutes les variables d'environnement ajoutées
- [ ] Service déployé et "Live" (vert)
- [ ] Test `/api/health` retourne 200

### Frontend (Vercel)

- [ ] Projet connecté à GitHub
- [ ] Framework Preset: **Vite**
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Toutes les variables d'environnement ajoutées (avec `VITE_` prefix)
- [ ] Redéployé après ajout des variables
- [ ] Test page d'accueil charge correctement

### DNS

- [ ] Domaine principal (`altusfinancesgroup.com`) pointe vers Vercel
- [ ] Sous-domaine API (`api.altusfinancesgroup.com`) pointe vers Render
- [ ] DNS propagé (vérifiez avec `nslookup api.altusfinancesgroup.com`)

### Tests Finaux

- [ ] Page d'accueil charge sans erreurs 404
- [ ] Login fonctionne (cookies de session créés)
- [ ] Dashboard charge les données depuis l'API
- [ ] Chat WebSocket se connecte
- [ ] Envoi de message dans le chat fonctionne

---

## 🐛 Debugging en Production

### Voir les Logs Backend (Render)

1. Allez sur Render Dashboard
2. Cliquez sur votre service
3. Onglet **Logs**
4. Recherchez les erreurs ou les requêtes rejetées

### Voir les Erreurs Frontend (Vercel)

1. Ouvrez la console navigateur (F12)
2. Onglet **Console** pour les erreurs JavaScript
3. Onglet **Network** pour voir les requêtes qui échouent
4. Filtrez par "XHR" pour voir les appels API

### Vérifier les Variables d'Environnement

**Sur Vercel (build logs) :**
```
# Recherchez dans les logs de build
grep VITE_API_URL
```

**Sur Render (runtime logs) :**
```
# Au démarrage, votre backend affiche :
[CONFIG] Environment: production
[CONFIG] Frontend URL: https://altusfinancesgroup.com
```

---

## 🎯 Prochaines Étapes

1. **Configurer les variables d'environnement** (ci-dessus)
2. **Redéployer** Frontend (Vercel) et Backend (Render)
3. **Tester** avec la checklist
4. **Monitorer** les logs pour détecter les erreurs
5. **Corriger** les problèmes un par un

---

## 💡 Astuce : Page de Diagnostic

Votre application inclut déjà une page de diagnostic !

👉 Allez sur : `https://altusfinancesgroup.com/diagnostic`

Elle vous montrera :
- ✅ Si `VITE_API_URL` est définie
- ✅ Si le backend est accessible
- ✅ Si les cookies fonctionnent
- ✅ État de la connexion API

---

## 📞 Support

Si vous avez besoin d'aide :
1. Vérifiez d'abord la page `/diagnostic`
2. Consultez les logs Render et Vercel
3. Testez avec les commandes `curl` ci-dessus

Bon déploiement ! 🚀
