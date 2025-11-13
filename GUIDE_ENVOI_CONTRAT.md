# 📋 GUIDE : Comment envoyer un contrat signé

## 🚨 IMPORTANT : Vous NE VOYEZ PAS le bouton d'upload ?

**C'est NORMAL !** Le bouton d'upload n'apparaît qu'après l'approbation du prêt par l'admin.

---

## ✅ ÉTAPES COMPLÈTES

### ÉTAPE 1 : Créer une demande de prêt (✅ FAIT)
- Vous avez créé un prêt
- Statut actuel : **"En attente d'examen"**

### ÉTAPE 2 : L'admin approuve le prêt
**Action requise : Connectez-vous en tant qu'ADMIN**

1. Déconnectez-vous de votre compte utilisateur
2. Connectez-vous en tant qu'admin :
   - Email : `admin@altusfinancegroup.com`
   - Mot de passe : (celui que vous avez configuré)

3. Allez dans **"Admin Panel"** (panneau admin)
4. Cliquez sur **"Loans"** (Prêts)
5. Trouvez le prêt que vous venez de créer
6. Cliquez sur **"Approve"** (Approuver)

**➡️ À ce moment, le système :**
- ✅ Génère automatiquement le contrat PDF
- ✅ Envoie un email à l'utilisateur avec le lien
- ✅ Change le statut à "approved"

---

### ÉTAPE 3 : MAINTENANT vous verrez le bouton !
Reconnectez-vous en tant qu'**UTILISATEUR** :

1. Allez sur **Dashboard** (Tableau de bord)
2. Cliquez sur votre prêt approuvé
3. **🎉 VOUS VERREZ UNE ZONE JAUNE avec :**

```
┌─────────────────────────────────────────────┐
│  📄 Prêt approuvé !                         │
│                                             │
│  Votre prêt a été approuvé. Pour recevoir  │
│  les fonds, veuillez :                      │
│                                             │
│  1. Télécharger le contrat                 │
│  2. Signer le contrat                       │
│  3. Renvoyer le contrat signé en PDF        │
│                                             │
│  [📥 Télécharger le contrat]                │
│  [📤 Envoyer le contrat signé]  ← CE BOUTON│
└─────────────────────────────────────────────┘
```

---

### ÉTAPE 4 : Télécharger et signer
1. Cliquez sur **"Télécharger le contrat"**
2. Le PDF s'ouvre
3. **Signez-le** (à la main, stylet numérique, ou signature électronique)
4. **Sauvegardez-le en PDF**

---

### ÉTAPE 5 : Envoyer le contrat signé
1. Cliquez sur **"Envoyer le contrat signé"**
2. Sélectionnez votre fichier PDF signé
3. Cliquez "Ouvrir"

**➡️ Le système :**
- ✅ Valide que c'est bien un PDF
- ✅ Envoie le PDF directement par **EMAIL à tous les admins**
- ✅ Les admins reçoivent un email avec le PDF en pièce jointe
- ✅ Vous voyez une confirmation verte

---

### ÉTAPE 6 : L'admin reçoit l'email
**Les admins reçoivent un email comme ceci :**

```
De : ALTUS FINANCE GROUP <noreply@altusfinancegroup.com>
À : admin@altusfinancegroup.com

Sujet : 📄 Contrat signé reçu - Prêt #237241b8

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Contrat signé reçu

Détails du prêt :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Emprunteur :    demo compte
Email :         wy7syhzyinqlb@no.vsmailpro.com
ID du prêt :    237241b8-7215-445d-8f48-62fb8c...
Montant :       50 000 €
Uploadé le :    13/11/2025 à 19:30

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📎 Pièce jointe : contrat_signe_237241b8.pdf

[Bouton : Consulter dans le panneau admin]
```

---

## 🎯 RÉSUMÉ : POURQUOI VOUS NE VOYEZ PAS LE BOUTON ?

**Votre prêt est en statut "pending_review"**

Le bouton d'upload apparaît seulement quand :
- ✅ Le prêt a le statut **"approved"**
- ✅ Un contrat PDF a été généré
- ✅ Le contrat n'a pas encore été signé

---

## 🔧 COMMENT TESTER MAINTENANT ?

### Option A : Approuver votre propre prêt (pour tester)
1. **Se connecter en admin** : `admin@altusfinancegroup.com`
2. **Approuver le prêt** dans Admin Panel → Loans
3. **Se reconnecter en utilisateur**
4. **Voir le bouton d'upload** dans le dashboard

### Option B : Créer un utilisateur admin supplémentaire
Si vous n'avez pas le mot de passe admin, dites-le moi et je créerai un script pour vous.

---

## ❓ QUESTIONS FRÉQUENTES

**Q : Où le contrat signé est-il envoyé ?**
R : Directement par **email à tous les administrateurs** avec le PDF en pièce jointe.

**Q : Le contrat est-il stocké quelque part ?**
R : Non, il est envoyé directement par email. Pas de Cloudinary, pas de stockage externe.

**Q : L'admin peut-il télécharger le contrat depuis l'email ?**
R : Oui ! Le PDF est en pièce jointe, il peut l'ouvrir directement.

**Q : Que se passe-t-il après l'upload ?**
R : Le statut du prêt passe à "awaiting_admin_review" et l'admin peut valider le contrat dans le panneau admin.

---

## 📧 BESOIN D'AIDE ?

Si vous ne voyez toujours pas le bouton après avoir approuvé le prêt, vérifiez :
1. Que vous êtes bien connecté en utilisateur (pas en admin)
2. Que le statut du prêt est "approved"
3. Que vous avez rafraîchi la page

---

**Créé le : 13/11/2025**
**Dernière mise à jour : 13/11/2025**
