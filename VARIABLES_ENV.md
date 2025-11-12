# 📋 Variables d'Environnement - Altus Finance Group

## 🟢 VERCEL (Frontend)

**Emplacement**: Project Settings → Environment Variables

### Variables OBLIGATOIRES

```bash
VITE_API_URL=https://api.altusfinancegroup.com
VITE_SITE_URL=https://altusfinancegroup.com
```

---

## 🔵 RENDER (Backend)

**Emplacement**: Dashboard → Service → Environment Tab

### Variables OBLIGATOIRES - Configuration de base

```bash
# Environnement
NODE_ENV=production

# Sécurité - Session
# Générer avec: openssl rand -base64 32
SESSION_SECRET=VOTRE_CLE_SECRETE_ALEATOIRE_32_CARACTERES_MINIMUM

# Base de données PostgreSQL
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://...

# CORS et Cookies - Cross-domain
FRONTEND_URL=https://altusfinancegroup.com
COOKIE_DOMAIN=.altusfinancegroup.com
```

### Variables OPTIONNELLES - Fonctionnalités additionnelles

```bash
# Cloudinary - Upload d'images (photos profil, documents)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_cloudinary_api_key
CLOUDINARY_API_SECRET=votre_cloudinary_api_secret

# SendGrid - Envoi d'emails (OTP, notifications, vérification)
SENDGRID_API_KEY=SG.votre_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@altusfinancegroup.com

# Admin - Email pour notifications
ADMIN_EMAIL=admin@altusfinancegroup.com

# Port (Render définit automatiquement, optionnel)
PORT=10000
```

---

## 🔐 Comment générer SESSION_SECRET

```bash
# Sur Linux/Mac/WSL
openssl rand -base64 32

# Exemple de sortie:
# 8vK3mP9xN2qR7sT1wY4zC6bA5dF0hJ8
```

---

## 🔍 Vérification de la configuration

### 1. Vercel (Frontend)

```bash
# Dans le code, vérifier que les variables sont bien utilisées
console.log(import.meta.env.VITE_API_URL)
# Devrait afficher: https://api.altusfinancegroup.com
```

### 2. Render (Backend)

Vérifier les logs au démarrage :

```
============================================================
[CONFIG] Environment: production
[CONFIG] Cookie Domain: .altusfinancegroup.com
[CONFIG] Cookie SameSite: none
[CONFIG] Cookie Secure: true
[CONFIG] CORS Allowed Origins: production domains
[CONFIG] Frontend URL: https://altusfinancegroup.com
[CONFIG] Trust Proxy: enabled
============================================================
```

---

## ⚠️ Points critiques

### SESSION_SECRET
- ❌ **JAMAIS** utiliser "altus-group-secret-key-dev-only" en production
- ✅ **TOUJOURS** générer une clé aléatoire unique
- ✅ Minimum 32 caractères
- ✅ Garder cette valeur secrète

### DATABASE_URL
- ✅ Si vous utilisez Render PostgreSQL, cette variable est automatique
- ✅ Si vous utilisez Neon ou autre, copiez l'URL de connexion
- ✅ Format: `postgresql://user:password@host:port/database`
- ✅ SSL activé automatiquement en production

### COOKIE_DOMAIN
- ✅ **DOIT** commencer par un point: `.altusfinancegroup.com`
- ✅ Permet le partage de cookies entre `altusfinancegroup.com` et `api.altusfinancegroup.com`
- ❌ Sans le point, les cookies ne fonctionneront pas

### FRONTEND_URL
- ✅ **SANS** slash final: `https://altusfinancegroup.com`
- ❌ **PAS**: `https://altusfinancegroup.com/`

---

## 🧪 Test de configuration

### Backend

```bash
# Health check
curl https://api.altusfinancegroup.com/health

# Devrait retourner:
{
  "status": "ok",
  "environment": "production",
  "database": "connected",
  "timestamp": "2024-..."
}
```

### Frontend

1. Ouvrir: `https://altusfinancegroup.com`
2. Console navigateur (F12)
3. Tester une connexion
4. Vérifier:
   - ✅ Pas d'erreurs CORS
   - ✅ Cookies définis (Application → Cookies)
   - ✅ Cookie domain = `.altusfinancegroup.com`

---

## 📝 Checklist avant déploiement

### Vercel
- [ ] `VITE_API_URL` définie
- [ ] `VITE_SITE_URL` définie
- [ ] Build réussi
- [ ] `vercel.json` présent et correct

### Render
- [ ] `SESSION_SECRET` générée et définie
- [ ] `DATABASE_URL` définie
- [ ] `FRONTEND_URL` définie
- [ ] `COOKIE_DOMAIN` définie avec le point
- [ ] `NODE_ENV=production`
- [ ] (Optionnel) Cloudinary configuré
- [ ] (Optionnel) SendGrid configuré
- [ ] Build réussi
- [ ] Service démarré

### DNS
- [ ] `altusfinancegroup.com` → Vercel
- [ ] `www.altusfinancegroup.com` → Vercel
- [ ] `api.altusfinancegroup.com` → Render
- [ ] HTTPS activé partout

---

## 📞 Support

En cas de problème, vérifier dans l'ordre :

1. **Logs Render** : Dashboard → Logs
2. **Logs Vercel** : Deployments → Logs
3. **Console navigateur** : F12 → Console + Network
4. **Variables env** : Vérifier qu'elles sont toutes définies

---

## 🎯 Résumé rapide

**Vercel (2 variables):**
```
VITE_API_URL=https://api.altusfinancegroup.com
VITE_SITE_URL=https://altusfinancegroup.com
```

**Render (5 variables minimum):**
```
NODE_ENV=production
SESSION_SECRET=[openssl rand -base64 32]
DATABASE_URL=[fourni par Render PostgreSQL ou Neon]
FRONTEND_URL=https://altusfinancegroup.com
COOKIE_DOMAIN=.altusfinancegroup.com
```

**+ Optionnel (Cloudinary + SendGrid):**
```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@altusfinancegroup.com
ADMIN_EMAIL=admin@altusfinancegroup.com
```
