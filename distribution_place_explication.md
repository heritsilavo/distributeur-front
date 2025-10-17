# 🗃️ Distributeur Automatique de Boissons

## 🏗️ Architecture
- **4 étages** (Etage_1 à Etage_4)
- **6 places par étage** (Place_1 à Place_6)
- **6 emplacements par place** (1 à 6)
- **Capacité totale : 144 canettes**

## 📦 Règles de Stockage

### 1. Homogénéité par Place
- Tous les emplacements d'une place doivent contenir la **même boisson**
- Exemple : Si Place_1 contient du Coca, les 6 emplacements doivent être du Coca

### 2. Remplissage Séquentiel
- **Emplacement 1** : peut toujours être rempli
- **Emplacements 2-6** : ne peuvent être remplis que si l'emplacement précédent est occupé
- Règle : `Remplir(N) ⇔ (N=1) ∨ (Emplacement(N-1) est occupé)`

### 3. États des Emplacements
```typescript
{
  "isAvailable": boolean,  // true = vide, false = occupé
  "typeBoisson": string|null  // null si vide, sinon nom de la boisson
}
```

## 🔄 Scénarios Types

### ✅ Remplissage Valide :
```json
"Place_1": {
  "1": {"isAvailable": false, "typeBoisson": "Coca"},
  "2": {"isAvailable": false, "typeBoisson": "Coca"},  // ✓ car 1 occupé
  "3": {"isAvailable": true, "typeBoisson": null},     // ✓ séquence respectée
  "4": {"isAvailable": true, "typeBoisson": null},
  "5": {"isAvailable": true, "typeBoisson": null},
  "6": {"isAvailable": true, "typeBoisson": null}
}
```

### ❌ Remplissage Invalide :
```json
"1": {"isAvailable": false, "typeBoisson": "Coca"},
"2": {"isAvailable": true, "typeBoisson": null},      // ✓ valide
"3": {"isAvailable": false, "typeBoisson": "Coca"}    // ❌ interdit (2 vide)
```

## 📊 Capacités
- **Max canettes** : 144
- **Max types de boissons** : 24
- **État initial** : Tous les emplacements vides

## 🎯 Fonctionnement
- **Distribution** : FIFO ou LIFO selon stratégie
- **Remplissage** : Séquentiel obligatoire
- **Contrôle** : Cohérence type-boisson + séquence remplissage