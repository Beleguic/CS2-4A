# Architecture de Dénormalisation MongoDB/PostgreSQL - Tropicool

## 🎯 Vue d'ensemble

L'application Tropicool utilise une architecture hybride avec **PostgreSQL pour les écritures** et **MongoDB pour les lectures**, implémentant une stratégie de dénormalisation pour optimiser les performances.

## 🏗️ Architecture

```
┌─────────────────┐    Écritures    ┌─────────────────┐
│   Frontend      │ ──────────────► │   PostgreSQL    │
│   (Vue.js)      │                 │   (Source de    │
└─────────────────┘                 │   vérité)       │
         │                          └─────────────────┘
         │                                   │
         │ Lectures                          │
         │ (Optimisées)                      │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   MongoDB       │ ◄────────────── │   Service de    │
│   (Dénormalisé) │                 │   Dénormalisation│
└─────────────────┘                 └─────────────────┘
```

## 📊 Modèles de Données

### PostgreSQL (Source de vérité)
- **Structure relationnelle** complète
- **Intégrité référentielle** garantie
- **Transactions ACID**
- **Optimisé pour les écritures**

### MongoDB (Lecture optimisée)
- **Documents dénormalisés** avec toutes les relations intégrées
- **Index optimisés** pour les requêtes
- **Recherche textuelle** native
- **Agrégations** performantes

## 🔄 Service de Dénormalisation

### Fonctionnalités
- **Synchronisation automatique** PostgreSQL → MongoDB
- **Index optimisés** pour les performances
- **Gestion des erreurs** et retry
- **Monitoring** de la synchronisation

### Modèles Dénormalisés

#### Produit MongoDB
```javascript
{
  _id: "uuid",
  name: "Nom du produit",
  price: 29.99,
  description: "Description complète",
  image: "path/to/image.jpg",
  is_active: true,
  is_adult: false,
  reference: "REF001",
  tva: 20,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  // Relations dénormalisées
  categories: [
    {
      id: "cat-uuid",
      name: "Catégorie",
      description: "Description catégorie"
    }
  ],
  stock: {
    quantity: 100,
    alert_threshold: 10,
    is_low_stock: false
  },
  promotions: [
    {
      id: "promo-uuid",
      discount_percentage: 15,
      start_date: "2024-01-01",
      end_date: "2024-01-31",
      is_active: true
    }
  ],
  has_active_promotion: true,
  final_price: 25.49
}
```

#### Utilisateur MongoDB
```javascript
{
  _id: "user-uuid",
  email: "user@example.com",
  username: "username",
  firstName: "Prénom",
  lastName: "Nom",
  dateOfBirth: "1990-01-01",
  role: "user",
  is_verified: true,
  isSubscribedToNewsletter: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  // Statistiques calculées
  alerts_count: 5,
  orders_count: 12,
  total_spent: 1250.50,
  // Relations dénormalisées
  alerts: [
    {
      id: "alert-uuid",
      type: "restock",
      type_name: "Restock",
      product: {
        id: "prod-uuid",
        name: "Produit",
        price: 29.99
      },
      is_active: true
    }
  ],
  recent_orders: [
    {
      id: "order-uuid",
      total_amount: 125.50,
      status: "completed",
      created_at: "2024-01-01T00:00:00Z"
    }
  ]
}
```

## 🚀 Service de Lecture (ReadService)

### Fonctionnalités
- **Requêtes optimisées** MongoDB
- **Filtres avancés** (catégorie, prix, promotion, etc.)
- **Recherche textuelle** native
- **Pagination** et tri
- **Statistiques** agrégées

### Exemples d'utilisation

#### Recherche de produits
```javascript
// Recherche avec filtres
const products = await readService.getAllProducts({
  category_id: "cat-uuid",
  is_adult: false,
  has_promotion: true,
  price_min: 10,
  price_max: 100,
  search: "bière",
  low_stock: true
});
```

#### Recherche avancée
```javascript
// Recherche avancée avec tri
const results = await readService.advancedSearch({
  query: "bière artisanale",
  filters: {
    category_id: "cat-uuid",
    is_adult: false,
    has_promotion: true
  },
  sort: { field: "price", order: "asc" },
  limit: 20,
  offset: 0
});
```

#### Statistiques globales
```javascript
// Statistiques en temps réel
const stats = await readService.getGlobalStats();
// {
//   totalProducts: 150,
//   totalUsers: 1250,
//   totalCategories: 12,
//   lowStockProducts: 8,
//   productsWithPromotions: 25,
//   totalRevenue: 45678.90
// }
```

## 🔧 Contrôleurs Modifiés

### ProductController
- **Lectures** : Utilise `readService` (MongoDB)
- **Écritures** : Utilise `Product` (PostgreSQL) + synchronisation

### UserController
- **Lectures** : Utilise `readService` (MongoDB)
- **Écritures** : Utilise `User` (PostgreSQL) + synchronisation

### Pattern d'utilisation
```javascript
// Lecture optimisée (MongoDB)
const products = await readService.getAllProducts(filters);

// Écriture sécurisée (PostgreSQL)
const product = await Product.create(data);
await denormalizationService.syncProduct(product.id);
```

## 📈 Index MongoDB

### Produits
- `{ name: 'text', description: 'text' }` - Recherche textuelle
- `{ is_active: 1 }` - Filtrage actif/inactif
- `{ is_adult: 1 }` - Filtrage adulte
- `{ price: 1 }` - Tri par prix
- `{ created_at: -1 }` - Tri par date
- `{ 'categories.id': 1 }` - Filtrage par catégorie
- `{ has_active_promotion: 1 }` - Filtrage promotions

### Utilisateurs
- `{ email: 1 }` - Recherche par email
- `{ username: 1 }` - Recherche par username
- `{ role: 1 }` - Filtrage par rôle

### Commandes
- `{ user_id: 1 }` - Commandes par utilisateur
- `{ status: 1 }` - Filtrage par statut
- `{ created_at: -1 }` - Tri par date

## 🧪 Tests

### Script de test
```bash
npm run test-denormalization
```

### Synchronisation manuelle
```bash
npm run sync-data
```

## 🔍 Monitoring

### Logs de synchronisation
```
🔄 Initialisation du service de dénormalisation...
✅ Index MongoDB créés
✅ 150 produits synchronisés
✅ 1250 utilisateurs synchronisés
✅ 12 catégories synchronisées
✅ Service de dénormalisation initialisé
```

### Métriques
- **Temps de synchronisation**
- **Nombre d'objets synchronisés**
- **Erreurs de synchronisation**
- **Performance des requêtes**

## 🚨 Gestion d'Erreurs

### Stratégies
1. **Retry automatique** en cas d'échec
2. **Fallback** vers PostgreSQL si MongoDB indisponible
3. **Logging** détaillé des erreurs
4. **Monitoring** en temps réel

### Exemple de fallback
```javascript
try {
  // Essayer MongoDB d'abord
  const products = await readService.getAllProducts();
  return products;
} catch (error) {
  console.error('MongoDB indisponible, fallback vers PostgreSQL');
  // Fallback vers PostgreSQL
  const products = await Product.findAll();
  return products;
}
```

## 📋 Avantages

### Performance
- **Lectures ultra-rapides** avec MongoDB
- **Recherche textuelle** native
- **Agrégations** performantes
- **Index optimisés**

### Flexibilité
- **Documents dénormalisés** avec toutes les relations
- **Requêtes complexes** simplifiées
- **Évolutivité** horizontale

### Sécurité
- **Source de vérité** PostgreSQL
- **Intégrité** des données garantie
- **Transactions** ACID pour les écritures

## 🔮 Évolutions Futures

### Fonctionnalités prévues
- **Synchronisation en temps réel** avec WebSockets
- **Cache Redis** pour les données fréquemment accédées
- **Analytics** avancés avec MongoDB Aggregation
- **Recherche sémantique** avec Elasticsearch

### Optimisations
- **Sharding** MongoDB pour la scalabilité
- **Réplication** pour la haute disponibilité
- **Compression** des données
- **Archivage** automatique

## 📚 Ressources

- [Documentation MongoDB](https://docs.mongodb.com/)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Patterns de dénormalisation](https://martinfowler.com/articles/databases.html)
- [Architecture CQRS](https://martinfowler.com/bliki/CQRS.html) 