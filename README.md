# 🌱 Garden Planner - Planificateur de Potager

Application web de planification intelligente de potager basée sur le **compagnonnage** (companion planting). L'algorithme place automatiquement les légumes dans votre potager en optimisant les associations bénéfiques et en respectant les espacements requis.

![Version](https://img.shields.io/badge/version-1.0.0-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Fonctionnalités

- 🎯 **Optimisation Automatique** : Algorithme génétique avancé pour maximiser les bonnes associations
- 🌿 **Base de Compagnonnage** : 15 légumes courants avec règles d'associations scientifiques
- 📐 **Configuration Flexible** : Définissez les dimensions de votre potager en cm
- 🎨 **Visualisation Artistique** : Rendu réaliste avec React-Konva
- 📊 **Métriques Détaillées** : Score de compagnonnage, utilisation, diversité
- 📱 **Responsive** : Fonctionne sur mobile, tablette et desktop
- ⚡ **Performance** : Optimisation en moins de 10 secondes

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173)

### Build Production

```bash
npm run build
npm run preview
```

## 🧪 Tests

```bash
npm run test              # Tests unitaires
npm run test:ui           # Tests avec UI
npm run test:coverage     # Coverage
npm run test:e2e          # Tests E2E
```

## 📦 Stack Technique

- **React 18** + **TypeScript 5.6**
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React-Konva** - Visualisation canvas
- **Vitest** + **Playwright** - Tests

## 🏗️ Architecture

```
src/
├── algorithms/optimizer/     # Moteur d'optimisation
│   ├── GardenOptimizer.ts              # Orchestrateur
│   ├── scoringFunctions.ts             # Évaluation
│   └── strategies/
│       ├── ConstraintSatisfaction.ts   # CSP
│       └── GeneticAlgorithm.ts         # Algo génétique
├── components/               # Composants React
├── context/                  # State management
├── data/                     # Base de données JSON
├── hooks/                    # Custom hooks
└── utils/                    # Utilitaires
```

## 🌿 Légumes Disponibles

15 légumes courants inclus :
🍅 Tomate • 🌿 Basilic • 🥕 Carotte • 🥬 Laitue • 🔴 Radis • 🥒 Courgette • 🫘 Haricot • 🧅 Oignon • 🫑 Poivron • 🥬 Épinard • 🍇 Betterave • 🥒 Concombre • 🥔 Pomme de terre • 🥬 Chou • 🫛 Pois

## 🤝 Compagnonnage

### ✅ Associations Bénéfiques

- **Tomate + Basilic** : Repousse les ravageurs
- **Carotte + Oignon** : Protection mutuelle
- **Haricot + Maïs + Courge** : Les "Trois Sœurs"

### ❌ À Éviter

- **Tomate + Pomme de terre** : Mildiou commun
- **Haricot + Oignon** : Inhibition de croissance

## 🎯 Algorithme

### 3 Phases d'Optimisation

1. **CSP** : Layout initial faisable
2. **Génétique** : 100 individus × 50 générations
3. **Score** : `0.4×compagnonnage + 0.3×utilisation + 0.2×diversité + 0.1×espacement`

## 📊 Métriques

- Score de Compagnonnage
- Taux d'Utilisation (%)
- Score de Diversité
- Respect des Espacements
- **Score Global /10**

## 🎨 Interface

- **Sidebar** : Configuration dimensions + sélection légumes
- **Canvas** : Visualisation artistique du potager
- **Métriques** : Affichage temps réel

## 🔮 Roadmap

- [ ] Tooltips enrichis
- [ ] Zoom & Pan interactifs
- [ ] Export PDF/PNG
- [ ] Formes personnalisées
- [ ] Calendrier de plantation
- [ ] Backend & Sync multi-device

## 🤝 Contribution

Les contributions sont bienvenues ! Fork, branch, commit, push, PR.

## 📝 License

MIT

---

**Bon jardinage ! 🌱🌻🥕**

*Développé avec ❤️ et Claude Opus 4.5*
