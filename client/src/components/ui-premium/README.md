# Composants UI Premium Altus Finances 2025

Bibliothèque de composants UI premium pour Altus Finances Group, conçue avec un design niveau banque privée 2025.

## Installation

Les composants sont déjà configurés et prêts à l'emploi. Importez-les depuis :

```tsx
import { 
  ButtonPremium, 
  CardPremium, 
  ProgressGlow, 
  InfoBarPremium, 
  TopbarPremium, 
  SidebarPremium 
} from '@/components/ui-premium';
```

## Design System

Les variables CSS et couleurs sont définies dans `client/src/styles/theme.css` :

- `--altusfinances-indigo`: #5b21b6 (couleur principale)
- `--altusfinances-royal`: #3b82f6 (couleur secondaire)
- `--altusfinances-ink`: #0f172a (texte principal)
- `--altusfinances-muted`: #6b7280 (texte secondaire)
- `--soft-shadow`: 0 6px 30px rgba(11, 15, 30, 0.06)

## Composants

### ButtonPremium

Bouton avec 3 variantes et 3 tailles.

```tsx
<ButtonPremium variant="solid" size="md" data-testid="button-action">
  Cliquez ici
</ButtonPremium>
```

**Props:**
- `variant`: "solid" | "ghost" | "outline" (défaut: "solid")
- `size`: "sm" | "md" | "lg" (défaut: "md")
- Tous les attributs HTML de `<button>`

### CardPremium

Carte avec ombre douce et bordures arrondies.

```tsx
<CardPremium className="max-w-md">
  <h3>Titre</h3>
  <p>Contenu de la carte...</p>
</CardPremium>
```

**Props:**
- `children`: Contenu de la carte
- `className`: Classes CSS supplémentaires

### ProgressGlow

Barre de progression animée avec effet de brillance.

```tsx
<ProgressGlow value={75} />
```

**Props:**
- `value`: 0-100 (défaut: 50)

### InfoBarPremium

Barre d'information défilante avec rotation automatique des messages.

```tsx
<InfoBarPremium />
```

Les messages se mettent à jour automatiquement toutes les 3,5 secondes avec des icônes lucide-react.

### TopbarPremium

En-tête responsive avec navigation et logo.

```tsx
<TopbarPremium 
  onMenuClick={() => setMenuOpen(true)}
  rightNode={<UserMenu />}
/>
```

**Props:**
- `onMenuClick`: Fonction appelée au clic sur le menu mobile
- `rightNode`: Élément React à afficher à droite (optionnel)

### SidebarPremium

Barre latérale de navigation.

```tsx
<SidebarPremium
  items={[
    { key: 'dashboard', label: 'Tableau de bord', icon: <Home /> },
    { key: 'loans', label: 'Mes prêts', icon: <CreditCard /> }
  ]}
  onSelect={(key) => navigate(`/${key}`)}
/>
```

**Props:**
- `items`: Tableau d'objets avec `key`, `label`, et `icon` (optionnel)
- `onSelect`: Fonction appelée lors de la sélection d'un élément

## Animations

Les animations sont centralisées dans `theme.css` :

- `animate-info-fade`: Animation de fondu pour InfoBarPremium
- `animate-progress-slide`: Animation de brillance pour ProgressGlow

## Accessibilité

Tous les composants incluent :
- Attributs `data-testid` pour les tests
- Labels et attributs ARIA appropriés
- Support du clavier pour les éléments interactifs

## Couleurs Tailwind

Nouvelles couleurs disponibles :

```tsx
className="bg-altusfinances-indigo text-white"
className="text-altusfinances-royal"
className="text-altusfinances-ink"
className="text-altusfinances-muted"
className="shadow-soft-2025"
className="rounded-xl-3"
```
