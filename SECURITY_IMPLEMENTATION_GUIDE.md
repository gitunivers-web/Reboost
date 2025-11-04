# Guide d'Implémentation de Sécurité - Altus Group

## 📊 État Actuel de la Sécurité

### Score Estimé: **75/100**

## ✅ Améliorations Implémentées (Backend)

### 1. Headers de Sécurité (Helmet)
- ✅ CSP (Content Security Policy) configuré
- ✅ HSTS (Strict-Transport-Security) - 1 an, includeSubDomains
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection activé
- ✅ Referrer-Policy: strict-origin-when-cross-origin

### 2. Protection CSRF (Partiellement Implémenté)
- ✅ Génération de tokens CSRF avec `randomBytes(32)`
- ✅ Endpoint `/api/csrf-token` disponible
- ✅ Middleware `requireCSRF` créé
- ✅ Cookies session avec `SameSite=strict`
- ⚠️ **CRITIQUE: Middleware non appliqué aux routes**

### 3. Validation des Fichiers Uploadés
- ✅ Validation MIME type et extension côté serveur
- ✅ Vérification du contenu réel avec `fileTypeFromFile`
- ✅ Limite de taille: 5MB max
- ✅ Nettoyage automatique des fichiers invalides
- ✅ Stockage isolé dans `uploads/kyc/`
- ✅ Types autorisés: PDF, JPEG, PNG, WebP

### 4. Rate Limiting Complet
```javascript
authLimiter: 5 tentatives / 15 minutes (login/signup)
loanLimiter: 5 demandes / heure (demandes de prêt)
transferLimiter: 10 transferts / heure
validationLimiter: 10 codes / 5 minutes
uploadLimiter: 20 uploads / heure
adminLimiter: 100 requêtes / 5 minutes
generalApiLimiter: 200 requêtes / 15 minutes
```

### 5. Validation Zod Stricte
- ✅ Authentification (signup, login)
- ✅ Demandes de prêts avec limites (0-500,000 EUR)
- ✅ Uploads KYC
- ✅ Opérations admin avec `.strict()`
- ✅ Validation mot de passe: 12+ caractères, majuscules, minuscules, chiffres, caractères spéciaux

### 6. Audit Logging
- ✅ Login (avec IP et User-Agent)
- ✅ Logout
- ✅ Demandes de prêts
- ✅ Structure prête pour toutes opérations admin

### 7. Gestion des Mots de Passe
- ✅ Hachage bcrypt avec salt rounds = 10
- ✅ Vérification sécurisée avec `bcrypt.compare`
- ✅ Pas de stockage en clair

### 8. Tokens de Vérification Email
- ✅ Génération UUID aléatoire
- ✅ Expiration après 48 heures
- ✅ Rotation lors du renvoi
- ✅ Vérification de l'expiration avant validation

## ⚠️ Actions Critiques Requises

### 🔴 PRIORITÉ 1: Intégration Frontend CSRF (CRITIQUE)

Le système CSRF backend est prêt mais **doit être intégré au frontend**:

#### Backend (Déjà fait):
```javascript
// Endpoint pour obtenir le token
GET /api/csrf-token
// Retourne: { csrfToken: "..." }

// Middleware de validation
requireCSRF() // Vérifie x-csrf-token header ou body._csrf
```

#### Frontend (À IMPLÉMENTER):

1. **Récupérer le token au chargement de l'app:**
```typescript
// Dans client/src/lib/queryClient.ts ou un nouveau fichier
export const getCsrfToken = async (): Promise<string> => {
  const response = await fetch('/api/csrf-token');
  const data = await response.json();
  return data.csrfToken;
};

// Stocker dans un context ou zustand store
```

2. **Ajouter le token à toutes les requêtes POST/PUT/PATCH/DELETE:**
```typescript
// Modifier apiRequest dans queryClient.ts
export async function apiRequest(url: string, options: RequestInit = {}) {
  const csrfToken = await getCsrfToken(); // ou récupérer du store
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Ajouter CSRF token pour toutes requêtes mutantes
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  const response = await fetch(url, { ...options, headers });
  // ... reste du code
}
```

3. **Appliquer le middleware aux routes backend:**
```javascript
// Dans server/routes.ts, après requireAuth:
app.post("/api/loans", requireAuth, requireCSRF, loanLimiter, async (req, res) => {
  // ... code existant
});

app.post("/api/transfers/initiate", requireAuth, requireCSRF, transferLimiter, async (req, res) => {
  // ... code existant
});

// Appliquer à TOUTES les routes POST/PUT/PATCH/DELETE protégées
```

### 🔴 PRIORITÉ 2: Améliorer CSP (Content Security Policy)

#### Problème Actuel:
```javascript
scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
```
⚠️ `unsafe-inline` et `unsafe-eval` **annulent la protection XSS**

#### Solution Recommandée:

**Option A: Nonces (Recommandé pour React/Vite)**
```javascript
// server/index.ts
import crypto from 'crypto';

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // ... autres options
}));
```

**Option B: Hashes (Pour scripts inline spécifiques)**
```javascript
// Calculer hash SHA-256 de chaque script inline
// Puis ajouter au CSP
scriptSrc: ["'self'", "'sha256-HASH_DU_SCRIPT'"]
```

**Option C: Production stricte (Si pas de scripts inline)**
```javascript
scriptSrc: ["'self'"],
styleSrc: ["'self'"],
```

⚠️ **Note**: Testez en dev d'abord! Cela peut casser Vite HMR.

### 🟡 PRIORITÉ 3: Vérifier Application des Rate Limiters

Vérifier que chaque route sensible a son limiter:

```bash
# Routes à vérifier:
- /api/auth/signup ✅ (authLimiter)
- /api/auth/login ✅ (authLimiter)
- /api/loans ⚠️ (À vérifier - loanLimiter appliqué?)
- /api/transfers ✅ (transferLimiter)
- /api/transfers/initiate ✅ (transferLimiter)
- /api/kyc/upload ✅ (uploadLimiter)
- /api/admin/* ✅ (adminLimiter)
```

### 🟡 PRIORITÉ 4: Conformité GDPR

À implémenter:

1. **Bannière de consentement cookies:**
```typescript
// Component: client/src/components/CookieConsent.tsx
- Informer utilisateur sur cookies de session
- Obtenir consentement explicite
- Stocker préférence (localStorage)
```

2. **Politique de confidentialité:**
- ✅ Page `/privacy` existe
- ⚠️ Vérifier qu'elle couvre RGPD/GDPR

3. **Droits utilisateur:**
```typescript
// Endpoints à ajouter:
GET /api/user/data-export // Exporter données personnelles
DELETE /api/user/account // Supprimer compte (RGPD Article 17)
PATCH /api/user/privacy-settings // Gérer consentements
```

## 📋 Checklist Sécurité Complète

### Backend
- [x] Hachage mots de passe (bcrypt)
- [x] Session sécurisée (httpOnly, secure en prod)
- [x] SameSite=strict
- [x] Rate limiting sur auth
- [x] Rate limiting sur opérations métier
- [x] Validation Zod stricte
- [x] Audit logging
- [x] Headers sécurité (Helmet)
- [x] Upload validation stricte
- [x] Middlewares auth/admin
- [ ] **CSRF protection appliquée**
- [ ] **CSP strict (sans unsafe-*)**
- [ ] Rotation tokens API admin
- [ ] GDPR endpoints (export, suppression)

### Frontend
- [x] React échappe contenu (XSS protection native)
- [x] Aucun dangerouslySetInnerHTML trouvé
- [ ] **Intégration CSRF tokens**
- [ ] Bannière consentement cookies
- [ ] Gestion erreurs sécurité UX
- [ ] Timeout session auto-logout

### Infrastructure
- [x] SESSION_SECRET configuré
- [x] DATABASE_URL sécurisé
- [ ] SENDGRID_API_KEY (optionnel)
- [ ] Variables env production validées
- [ ] HTTPS enforced en production
- [ ] Logs d'audit en production

## 🎯 Roadmap pour 95-100%

### Phase 1: Critique (Requis maintenant)
1. Intégrer CSRF côté frontend ⭐
2. Appliquer requireCSRF à toutes routes mutantes ⭐
3. Améliorer CSP (retirer unsafe-*) ⭐

### Phase 2: Important
4. Implémenter bannière consentement GDPR
5. Ajouter endpoints GDPR (export/suppression données)
6. Tests de sécurité automatisés

### Phase 3: Améliorations
7. Rate limiting avancé par IP
8. Détection anomalies/bruteforce
9. 2FA (authentification deux facteurs)
10. Rotation automatique SESSION_SECRET

## 🔒 Recommandations Générales

1. **Ne jamais désactiver** la protection CSRF en production
2. **Tester CSP** en dev avant déploiement
3. **Monitorer** les logs d'audit pour activités suspectes
4. **Réviser** les secrets et tokens tous les 90 jours
5. **Scanner** régulièrement avec outils sécurité (npm audit, Snyk)
6. **Former** l'équipe aux bonnes pratiques

## 📞 Support

Pour questions sécurité, contacter l'équipe de sécurité.

**Dernière mise à jour**: 4 novembre 2025
