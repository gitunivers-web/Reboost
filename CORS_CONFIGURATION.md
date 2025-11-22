# Configuration CORS pour Vercel + Render

## Problème résolu

Les erreurs CORS dans les logs Render :
```
[ERROR] OPTIONS /api/detect-language - Status: 500
[ERROR] Message: Not Allowed by CORS
[ERROR] Origin: https://nouvemenmemeet-09nagewbd-github1vercel.app
```

## Solution sécurisée

Au lieu d'accepter **tous** les domaines `*.vercel.app` (faille de sécurité majeure), nous utilisons une variable d'environnement pour lister explicitement les domaines autorisés.

## Configuration sur Render

### Étape 1 : Ajouter la variable d'environnement

Dans votre dashboard Render (pour votre service backend) :

1. Allez dans **Environment** → **Environment Variables**
2. Ajoutez une nouvelle variable :
   - **Key** : `VERCEL_DOMAINS`
   - **Value** : `https://nouvemenmemeet-09nagewbd-github1vercel.app,https://altusfinancesgroup.vercel.app`

### Étape 2 : Format de la valeur

La valeur doit être une liste d'URLs **complètes** séparées par des **virgules** :

```
https://domain1.vercel.app,https://domain2.vercel.app,https://domain3-preview.vercel.app
```

**Exemples :**
- URL de production : `https://altusfinancesgroup.vercel.app`
- URL de preview : `https://nouvemenmemeet-09nagewbd-github1vercel.app`
- Plusieurs domaines : `https://altusfinancesgroup.vercel.app,https://preview-xyz.vercel.app`

### Étape 3 : Redémarrer le service

Après avoir ajouté la variable :
1. Cliquez sur **Manual Deploy** → **Deploy latest commit**
2. Attendez que le déploiement se termine

## Domaines autorisés automatiquement

Le backend autorise déjà ces domaines :
- ✅ `https://altusfinancesgroup.com`
- ✅ `https://www.altusfinancesgroup.com`
- ✅ La valeur de `FRONTEND_URL` (si définie)
- ✅ Tous les domaines listés dans `VERCEL_DOMAINS`

## Vérification

Après le déploiement, vérifiez les logs Render :
- ✅ Les requêtes depuis vos domaines Vercel devraient retourner **200 OK**
- ❌ Les domaines non autorisés recevront **Not allowed by CORS**

## Sécurité

⚠️ **IMPORTANT** : N'ajoutez que les domaines Vercel que vous contrôlez ! Chaque domaine autorisé peut accéder à votre API avec des cookies authentifiés.

## Développement local

En développement, tous les domaines localhost sont automatiquement autorisés :
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`

Pas besoin de configurer `VERCEL_DOMAINS` en local.
