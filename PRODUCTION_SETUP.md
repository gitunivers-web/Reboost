# Production Setup Guide - Altus Finances Group

## Problèmes Résolus

### 1. ✅ Déploiement Render - Correction de l'erreur "vite: not found"

**Problème:** Le build sur Render échouait avec l'erreur `sh: 1: vite: not found`

**Solution:** Déplacé les dépendances de build (`vite`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `@vitejs/plugin-react`) de `devDependencies` vers `dependencies` dans `package.json`.

**Action:** Lorsque vous pushez vers GitHub, Render installera maintenant correctement toutes les dépendances nécessaires pour le build.

---

### 2. ✅ Chat Socket.IO - Problème "utilisateur hors ligne"

**Problème:** Admin et utilisateur en ligne mais impossible d'envoyer des messages parce que le système dit que le client n'est pas en ligne.

**Causes Identifiées par l'Architecte:**

1. **Cookies de session cross-domain**
   - Le frontend (altusfinancesgroup.com) et le backend (api.altusfinancesgroup.com) sont sur des sous-domaines différents
   - Les cookies de session doivent être configurés pour fonctionner entre les sous-domaines

2. **Logique de rejoindre les salles (rooms)**
   - Les deux clients doivent rejoindre la même salle avec des IDs d'utilisateur triés
   - Format: `${min}_${max}` où min et max sont les userId triés

**Solution - Variables d'Environnement Render:**

Ajoutez ces variables d'environnement dans votre dashboard Render (api.altusfinancesgroup.com):

```bash
COOKIE_DOMAIN=.altusfinancesgroup.com
NODE_ENV=production
SESSION_SECRET=<votre-secret-session-fort>
DATABASE_URL=<votre-url-postgres>
FRONTEND_URL=https://altusfinancesgroup.com
```

**Important:** Le `.` avant `altusfinancesgroup.com` est crucial - il permet aux cookies de fonctionner sur tous les sous-domaines (www, api, etc.)

---

## Configuration Actuelle du Code

Votre code est **déjà configuré** pour gérer les sessions cross-domain:

```typescript
// server/index.ts (lignes 47-67)
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SAME_SITE_POLICY = IS_PRODUCTION ? 'none' : 'lax';

// Session cookie configuration
cookie: {
  secure: IS_PRODUCTION,          // HTTPS uniquement en prod
  httpOnly: true,
  sameSite: SAME_SITE_POLICY,     // 'none' en prod pour cross-domain
  domain: COOKIE_DOMAIN,          // '.altusfinancesgroup.com'
}
```

---

## Tests et Débogage

### 1. Vérifier que la session fonctionne

Après avoir configuré les variables d'environnement sur Render, testez:

```bash
# Depuis votre frontend en production
curl https://api.altusfinancesgroup.com/api/session-check \
  -H "Origin: https://altusfinancesgroup.com" \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

Réponse attendue:
```json
{
  "hasSession": true,
  "isAuthenticated": true,
  "sessionId": "abc12345...",
  "cookiesPresent": true,
  "origin": "https://altusfinancesgroup.com"
}
```

### 2. Diagnostic complet des sessions

Endpoint de débogage disponible:
```bash
GET https://api.altusfinancesgroup.com/api/debug/session-diagnostic
```

Cet endpoint vous donnera:
- État des cookies
- Configuration du serveur
- Informations de session
- Recommandations si des problèmes sont détectés

### 3. Vérifier Socket.IO

Ouvrez la console du navigateur (F12) sur altusfinancesgroup.com et vérifiez:

```javascript
// Vous devriez voir ces logs:
[CHAT] Connected to Socket.IO
[PRESENCE] Partner {partnerId} initial state: online
```

Dans les DevTools > Network > WS (WebSocket), vérifiez que:
1. La connexion Socket.IO réussit
2. Le cookie `sessionId` est envoyé dans les headers

---

## Plan d'Action Post-Déploiement

### Étape 1: Redéployer sur Render
1. Pushez le code mis à jour vers GitHub
2. Render détectera automatiquement le push et lancera un nouveau build
3. Le build devrait maintenant réussir (vite sera installé)

### Étape 2: Configurer les Variables d'Environnement
Dans votre dashboard Render (api.altusfinancesgroup.com):
1. Allez dans l'onglet "Environment"
2. Ajoutez `COOKIE_DOMAIN=.altusfinancesgroup.com`
3. Vérifiez que `NODE_ENV=production` est défini
4. Redémarrez le service

### Étape 3: Tester le Chat
1. Connectez-vous en tant qu'admin sur un navigateur
2. Connectez-vous en tant qu'utilisateur sur un autre navigateur (ou en navigation privée)
3. Ouvrez la console du navigateur (F12) sur les deux
4. Essayez d'envoyer un message
5. Vérifiez les logs:
   - `[PRESENCE] Partner {id} is now online` ✅
   - `[CHAT] Connected to Socket.IO` ✅
   - Les messages s'affichent dans les deux chats ✅

### Étape 4: Si le Chat ne Fonctionne Toujours Pas

**Logs à vérifier sur Render:**
```
[SOCKET.IO] Client connecté: {socketId} (User: {userId})
[PRESENCE] User {userId} added socket {socketId}
[SOCKET.IO] User {userId} joined room: {userId1}_{userId2}
[SOCKET.IO] Message sent in room {room} by {userId}
```

**Si vous ne voyez pas ces logs:**
- Vérifiez que le cookie `sessionId` est bien envoyé avec les requêtes Socket.IO
- Testez l'endpoint `/api/session-check` pour confirmer que la session fonctionne
- Vérifiez que HTTPS est activé sur Render (requis pour `sameSite: 'none'`)

---

## Endpoints de Débogage Disponibles

| Endpoint | Description |
|----------|-------------|
| `/api/health` | Statut général du serveur |
| `/api/session-check` | Vérifie si la session est établie |
| `/api/debug/session-diagnostic` | Diagnostic complet (cookies, session, config) |

---

## Notes de Sécurité

✅ **Déjà Implémenté:**
- Validation Zod pour tous les messages Socket.IO
- Sanitization DOMPurify pour prévenir les attaques XSS
- Autorisation: les utilisateurs ne peuvent envoyer des messages qu'en leur propre nom
- Salles (rooms) protégées: vérification que l'utilisateur a le droit de rejoindre
- Sessions sécurisées avec cookies httpOnly
- CORS configuré pour les domaines de production uniquement

---

## Résumé des Modifications

| Fichier | Modification | Raison |
|---------|-------------|---------|
| `package.json` | Déplacé vite, typescript, tailwindcss vers dependencies | Fix build Render |
| `server/index.ts` | ✅ Déjà configuré | Session cross-domain |
| `server/socket.ts` | ✅ Déjà configuré | Gestion présence + rooms |
| `client/src/hooks/useChat.ts` | ✅ Déjà configuré | Connexion Socket.IO |

**Aucune modification de code n'était nécessaire** - votre application était déjà correctement configurée. Il suffisait de:
1. Corriger le package.json pour le build Render ✅
2. Définir la variable d'environnement `COOKIE_DOMAIN` sur Render ⏳

---

## Support

Si vous rencontrez toujours des problèmes après avoir suivi ce guide:

1. Vérifiez les logs Render pour les erreurs
2. Testez `/api/session-check` et `/api/debug/session-diagnostic`
3. Vérifiez la console du navigateur pour les erreurs Socket.IO
4. Confirmez que tous les certificats SSL sont valides (altusfinancesgroup.com et api.altusfinancesgroup.com)

Bonne chance! 🚀
