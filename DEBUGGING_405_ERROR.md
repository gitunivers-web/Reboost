# Guide de Débogage - Erreur 405 en Production

## 🔍 Logs de Diagnostic Ajoutés

Des logs détaillés ont été ajoutés pour identifier la cause de l'erreur 405 lors de l'inscription en production.

## 📋 Comment Lire les Logs Render

### 1. Au Démarrage du Serveur

Recherchez ces lignes dans les logs Render au démarrage :

```
✅ Backend API server listening on port 5000
🌍 Environment: production
🗄️ Database: Connected
[CONFIG] FRONTEND_URL: https://altusfinancegroup.com
[CONFIG] Allowed Origins: ["https://altusfinancegroup.com"]
[CONFIG] Cookie Domain: .altusfinancegroup.com
[CONFIG] Cookie Secure: true
[CONFIG] Cookie SameSite: none
```

**✅ Vérifiez :**
- `FRONTEND_URL` doit être exactement `https://altusfinancegroup.com` (sans slash `/` à la fin)
- `Allowed Origins` doit contenir votre domaine frontend

### 2. Lors d'une Tentative d'Inscription

Recherchez ces patterns dans les logs :

#### Pattern A - Requête OPTIONS (Preflight CORS)
```
[CORS DEBUG] Incoming request: OPTIONS /api/auth/signup
[CORS DEBUG] Origin: https://altusfinancegroup.com
[CORS DEBUG] Headers: {...}
[CORS DEBUG] ✅ Origin allowed: https://altusfinancegroup.com
```

#### Pattern B - Requête POST (Inscription réelle)
```
[CORS DEBUG] Incoming request: POST /api/auth/signup
[CORS DEBUG] Origin: https://altusfinancegroup.com
[CORS DEBUG] Headers: {"content-type":"application/json","x-csrf-token":"present",...}
[CORS DEBUG] ✅ Origin allowed: https://altusfinancegroup.com
POST /api/auth/signup 201 in XXXms
```

#### Pattern C - Erreur CORS
```
[CORS ERROR] ❌ Origin rejected: https://www.altusfinancegroup.com
[CORS ERROR] Allowed origins: ["https://altusfinancegroup.com"]
```

#### Pattern D - Erreur Générale
```
[ERROR] POST /api/auth/signup - Status: 405
[ERROR] Message: Method Not Allowed
[ERROR] Origin: https://altusfinancegroup.com
```

## 🔎 Causes Possibles de l'Erreur 405

### Cause 1 : Mauvaise Origin CORS
**Symptôme dans les logs :**
```
[CORS ERROR] ❌ Origin rejected: https://www.altusfinancegroup.com
```

**Solution :**
- Vérifiez que Vercel est configuré sur `altusfinancegroup.com` (sans `www`)
- OU ajoutez `www.altusfinancegroup.com` aux origins autorisées

**Modification du code :**
```javascript
const allowedOrigins = [
  'https://altusfinancegroup.com',
  'https://www.altusfinancegroup.com'  // Ajouter si nécessaire
];
```

### Cause 2 : Variable FRONTEND_URL Mal Configurée
**Symptôme dans les logs :**
```
[CONFIG] FRONTEND_URL: NOT SET
ou
[CONFIG] Allowed Origins: ["undefined"]
```

**Solution :**
Vérifiez dans Render que `FRONTEND_URL=https://altusfinancegroup.com` est définie

### Cause 3 : Requête OPTIONS Bloquée
**Symptôme dans les logs :**
```
[CORS DEBUG] Incoming request: OPTIONS /api/auth/signup
[ERROR] OPTIONS /api/auth/signup - Status: 405
```

**Solution :**
Vérifier que la méthode OPTIONS est autorisée dans CORS (déjà configurée normalement)

### Cause 4 : Render Bloque les Méthodes
**Symptôme :** 
Aucun log `[CORS DEBUG]` n'apparaît du tout

**Solution :**
Render pourrait bloquer en amont. Vérifiez les paramètres Render Web Service.

### Cause 5 : CSRF Token Manquant
**Symptôme dans les logs :**
```
[CORS DEBUG] Headers: {...,"x-csrf-token":"missing"}
POST /api/auth/signup 403 in XXms
```

**Solution :**
Le frontend doit d'abord appeler `/api/csrf-token` avant `/api/auth/signup`

## 📝 Checklist de Débogage

1. **Vérifier les logs de démarrage**
   - [ ] `FRONTEND_URL` est correctement défini
   - [ ] `Allowed Origins` contient le bon domaine

2. **Tenter une inscription et vérifier les logs**
   - [ ] Cherchez `[CORS DEBUG] Incoming request: POST /api/auth/signup`
   - [ ] Vérifiez si l'origin est accepté ou rejeté
   - [ ] Notez le status code final (200, 201, 405, 403, etc.)

3. **Comparer avec les patterns ci-dessus**
   - [ ] Identifiez quel pattern correspond à vos logs
   - [ ] Appliquez la solution correspondante

4. **Vérifications Frontend (Console Navigateur F12)**
   - [ ] Onglet Network → Cherchez la requête `/api/auth/signup`
   - [ ] Vérifiez les headers de la requête (Origin, Content-Type)
   - [ ] Vérifiez la réponse (status, headers CORS)

## 🚀 Actions Immédiates

1. **Redéployez sur Render** avec le nouveau code
2. **Tentez une inscription** sur `https://altusfinancegroup.com`
3. **Ouvrez les logs Render** en temps réel
4. **Copiez les logs** qui apparaissent lors de l'inscription
5. **Comparez avec les patterns** de ce guide

## 💡 Logs Importants à Partager

Si le problème persiste, partagez ces informations :

1. **Logs de démarrage** (section `[CONFIG]`)
2. **Logs de la tentative d'inscription** (tout ce qui contient `signup`)
3. **Console navigateur** (F12 → Network → Requête signup)
4. **Variables d'environnement** Render (masquez les secrets)

## ⚠️ Notes Importantes

- Les logs `[CORS DEBUG]` apparaissent **uniquement en production** (NODE_ENV=production)
- En développement (Replit), ces logs ne s'affichent pas
- Chaque requête POST est précédée d'une requête OPTIONS (preflight)
