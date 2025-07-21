# 📋 TODO DÉTAILLÉ - PROJET TROPICOOL

## 🎯 Vue d'Ensemble

Ce document détaille toutes les tâches restantes pour finaliser le projet Tropicool selon les spécifications des règles Cursor. Le projet est **très bien avancé** avec une architecture solide, mais il manque principalement les interfaces utilisateur et quelques fonctionnalités avancées.

**Progression Globale :** 75% (15/20 fonctionnalités majeures complétées)

---

## 🚨 PRIORITÉ MAXIMALE (1-2 semaines)

### **1. Interface de Gestion des Alertes** 
**Statut :** ❌ Manquant | **Priorité :** 🔴 CRITIQUE

#### **1.1 Page de Gestion des Alertes Utilisateur**
- [x] **Tâche 1.1.1** : Créer la vue `AlertPreferences.vue` ✅ **TERMINÉ**
- [x] **Tâche 1.1.2** : Implémenter les composants de sélection d'alertes ✅ **TERMINÉ**
- [x] **Tâche 1.1.3** : Ajouter la route `/alert-preferences` dans le router ✅ **TERMINÉ**
- [x] **Tâche 1.1.4** : Créer le store Pinia pour les préférences d'alertes ✅ **TERMINÉ**
- [x] **Tâche 1.1.5** : Intégrer dans la page profil utilisateur ✅ **TERMINÉ**

#### **1.2 Composants d'Alertes**
- [x] **Tâche 1.2.1** : Créer `AlertNotification.vue` (notifications d'alertes) ✅ **TERMINÉ**
- [x] **Tâche 1.2.2** : Créer `AlertList.vue` (liste avec filtres et pagination) ✅ **TERMINÉ**
- [x] **Tâche 1.2.3** : Créer `AlertBadge.vue` (badge avec compteur) ✅ **TERMINÉ**
- [x] **Tâche 1.2.4** : Créer `AlertToggle.vue` (toggle pour activer/désactiver) ✅ **TERMINÉ**
- [x] **Tâche 1.2.5** : Créer `AlertTypeSelector.vue` (sélection par type) ✅ **TERMINÉ**
- [x] **Tâche 1.2.6** : Créer `ProductAlertForm.vue` (alertes par produit) ✅ **TERMINÉ**
- [x] **Tâche 1.2.7** : Créer `CategoryAlertForm.vue` (alertes par catégorie) ✅ **TERMINÉ**

#### **1.3 API Frontend**
- [x] **Tâche 1.3.1** : Créer le service `alertService.ts` ✅ **TERMINÉ**
- [x] **Tâche 1.3.2** : Implémenter les méthodes CRUD pour les alertes ✅ **TERMINÉ**
- [x] **Tâche 1.3.3** : Ajouter la gestion des erreurs et loading states ✅ **TERMINÉ**
- [x] **Tâche 1.3.4** : Intégrer les notifications toast ✅ **TERMINÉ**

### **2. Recherche Facettée Complète**
**Statut :** ⚠️ Partiel | **Priorité :** 🔴 CRITIQUE

#### **2.1 Filtre par Marque**
- [x] **Tâche 2.1.1** : Ajouter le champ `brand` au modèle Product (PostgreSQL) ✅ **TERMINÉ**
- [x] **Tâche 2.1.2** : Mettre à jour le schéma MongoDB Product ✅ **TERMINÉ**
- [x] **Tâche 2.1.3** : Modifier le service `readService.js` pour supporter le filtre marque ✅ **TERMINÉ**
- [x] **Tâche 2.1.4** : Mettre à jour le contrôleur `productController.js` ✅ **TERMINÉ**
- [x] **Tâche 2.1.5** : Ajouter le filtre marque dans `FrontProduct.vue` ✅ **TERMINÉ**

#### **2.2 Filtre Produits en Promotion**
- [x] **Tâche 2.2.1** : Améliorer le filtre promotion dans `FrontProduct.vue` ✅ **TERMINÉ**
- [x] **Tâche 2.2.2** : Ajouter le support du filtre promotion dans `readService.js` ✅ **TERMINÉ**
- [x] **Tâche 2.2.3** : Améliorer l'affichage des prix avec prix barré et badge PROMO ✅ **TERMINÉ**
- [x] **Tâche 2.2.4** : Ajouter le tri par pourcentage de réduction ✅ **TERMINÉ**
- [x] **Tâche 2.2.5** : Intégrer le tri promotion dans l'URL ✅ **TERMINÉ**

#### **2.3 URL Partageables**
- [x] **Tâche 2.3.1** : Améliorer la synchronisation URL/filtres ✅ **TERMINÉ**
- [x] **Tâche 2.3.2** : Ajouter le support des filtres marque et promo dans l'URL ✅ **TERMINÉ**
- [x] **Tâche 2.3.3** : Implémenter la validation des paramètres URL ✅ **TERMINÉ**
- [x] **Tâche 2.3.4** : Ajouter la gestion des erreurs pour les paramètres invalides ✅ **TERMINÉ**
- [x] **Tâche 2.3.5** : Créer une fonction de nettoyage des paramètres URL ✅ **TERMINÉ**
- [x] **Tâche 2.3.6** : Ajouter un bouton de partage d'URL avec API Web Share ✅ **TERMINÉ**

### **3. Dashboard d'Administration Avancé**
**Statut :** ❌ Manquant | **Priorité :** 🔴 CRITIQUE

#### **3.1 Dashboard Principal**
- [x] **Tâche 3.1.1** : Créer `DashboardHome.vue` avec datavisualisation ✅ **TERMINÉ**
- [x] **Tâche 3.1.2** : Implémenter les graphiques avec Chart.js ✅ **TERMINÉ**
- [x] **Tâche 3.1.3** : Ajouter les KPI en temps réel ✅ **TERMINÉ**
- [x] **Tâche 3.1.4** : Créer les widgets personnalisables ✅ **TERMINÉ**

#### **3.2 Widgets de Données**
- [x] **Tâche 3.2.1** : Widget "Ventes par période" (graphique linéaire) ✅ **TERMINÉ**
- [x] **Tâche 3.2.2** : Widget "Produits les plus vendus" (graphique en barres) ✅ **TERMINÉ**
- [x] **Tâche 3.2.3** : Widget "Répartition des commandes" (graphique circulaire) ✅ **TERMINÉ**
- [x] **Tâche 3.2.4** : Widget "Évolution des stocks" (graphique area) ✅ **TERMINÉ**

#### **3.3 Système de Widgets**
- [x] **Tâche 3.3.1** : Créer le système de drag & drop pour les widgets ✅ **TERMINÉ**
- [x] **Tâche 3.3.2** : Implémenter la sauvegarde des préférences utilisateur ✅ **TERMINÉ**
- [x] **Tâche 3.3.3** : Ajouter la possibilité de redimensionner les widgets ✅ **TERMINÉ**
- [x] **Tâche 3.3.4** : Créer les paramètres de personnalisation ✅ **TERMINÉ**

### **4. Historique Commandes Complet**
**Statut :** ❌ Manquant | **Priorité :** 🔴 CRITIQUE

#### **4.1 Page Historique Commandes**
- [ ] **Tâche 4.1.1** : Créer `OrderHistory.vue`
- [ ] **Tâche 4.1.2** : Implémenter la liste des commandes avec pagination
- [ ] **Tâche 4.1.3** : Ajouter les filtres (date, statut, montant)
- [ ] **Tâche 4.1.4** : Créer la recherche dans l'historique

#### **4.2 Fonctionnalités de Commande**
- [ ] **Tâche 4.2.1** : Implémenter "Commander à nouveau"
- [ ] **Tâche 4.2.2** : Créer la demande de facturation
- [ ] **Tâche 4.2.3** : Implémenter la demande de retour
- [ ] **Tâche 4.2.4** : Ajouter le suivi de livraison

#### **4.3 Détails de Commande**
- [ ] **Tâche 4.3.1** : Créer `OrderDetail.vue`
- [ ] **Tâche 4.3.2** : Afficher les détails complets de la commande
- [ ] **Tâche 4.3.3** : Ajouter les actions disponibles (retour, facture)
- [ ] **Tâche 4.3.4** : Intégrer le statut de livraison

---

## 🔶 PRIORITÉ ÉLEVÉE (2-3 semaines)

### **5. Intégration PayPal**
**Statut :** ❌ Manquant | **Priorité :** 🟡 ÉLEVÉE

#### **5.1 Configuration PayPal**
- [ ] **Tâche 5.1.1** : Installer le SDK PayPal
- [ ] **Tâche 5.1.2** : Configurer les variables d'environnement PayPal
- [ ] **Tâche 5.1.3** : Créer le contrôleur `paypalController.js`
- [ ] **Tâche 5.1.4** : Implémenter les routes PayPal

#### **5.2 Interface de Paiement**
- [ ] **Tâche 5.2.1** : Créer `PayPalCheckout.vue`
- [ ] **Tâche 5.2.2** : Intégrer les boutons PayPal
- [ ] **Tâche 5.2.3** : Gérer les webhooks PayPal
- [ ] **Tâche 5.2.4** : Ajouter l'option PayPal dans le processus de paiement

#### **5.3 Gestion des Commandes**
- [ ] **Tâche 5.3.1** : Mettre à jour le modèle Order pour PayPal
- [ ] **Tâche 5.3.2** : Implémenter la gestion des remboursements PayPal
- [ ] **Tâche 5.3.3** : Ajouter la facturation PayPal

### **6. Gestion Livraison Avancée**
**Statut :** ⚠️ Basique | **Priorité :** 🟡 ÉLEVÉE

#### **6.1 Points Relais**
- [ ] **Tâche 6.1.1** : Créer le modèle `RelayPoint.js`
- [ ] **Tâche 6.1.2** : Implémenter l'API de recherche de points relais
- [ ] **Tâche 6.1.3** : Créer l'interface de sélection de point relais
- [ ] **Tâche 6.1.4** : Ajouter la gestion des frais de point relais

#### **6.2 Géolocalisation Google Maps**
- [ ] **Tâche 6.2.1** : Intégrer l'API Google Maps
- [ ] **Tâche 6.2.2** : Créer `DeliveryMap.vue`
- [ ] **Tâche 6.2.3** : Implémenter la géolocalisation utilisateur
- [ ] **Tâche 6.2.4** : Ajouter le calcul de distance

#### **6.3 Rayon 10km avec GeoJSON**
- [ ] **Tâche 6.3.1** : Créer le schéma GeoJSON pour les zones de livraison
- [ ] **Tâche 6.3.2** : Implémenter la validation de zone de livraison
- [ ] **Tâche 6.3.3** : Ajouter les frais de livraison par zone
- [ ] **Tâche 6.3.4** : Créer l'interface de gestion des zones

### **7. Rôles Utilisateurs Spécialisés**
**Statut :** ⚠️ Partiel | **Priorité :** 🟡 ÉLEVÉE

#### **7.1 ROLE_STORE_KEEPER**
- [ ] **Tâche 7.1.1** : Créer le middleware de vérification du rôle
- [ ] **Tâche 7.1.2** : Créer `StoreKeeperDashboard.vue`
- [ ] **Tâche 7.1.3** : Implémenter la gestion avancée des stocks
- [ ] **Tâche 7.1.4** : Ajouter les alertes de stock personnalisées

#### **7.2 ROLE_COMPTA**
- [ ] **Tâche 7.2.1** : Créer `ComptaDashboard.vue`
- [ ] **Tâche 7.2.2** : Implémenter l'extraction de factures
- [ ] **Tâche 7.2.3** : Ajouter les rapports financiers
- [ ] **Tâche 7.2.4** : Créer les exports comptables

#### **7.3 Gestion des Permissions**
- [ ] **Tâche 7.3.1** : Améliorer le système de permissions
- [ ] **Tâche 7.3.2** : Créer l'interface de gestion des rôles
- [ ] **Tâche 7.3.3** : Implémenter la granularité des permissions
- [ ] **Tâche 7.3.4** : Ajouter l'audit des actions par rôle

### **8. Widgets Personnalisables**
**Statut :** ❌ Manquant | **Priorité :** 🟡 ÉLEVÉE

#### **8.1 Système de Widgets**
- [ ] **Tâche 8.1.1** : Créer `WidgetManager.vue`
- [ ] **Tâche 8.1.2** : Implémenter le drag & drop avec Sortable.js
- [ ] **Tâche 8.1.3** : Créer le système de sauvegarde des layouts
- [ ] **Tâche 8.1.4** : Ajouter la possibilité de créer des widgets personnalisés

#### **8.2 Types de Widgets**
- [ ] **Tâche 8.2.1** : Widget "Métriques en temps réel"
- [ ] **Tâche 8.2.2** : Widget "Graphiques interactifs"
- [ ] **Tâche 8.2.3** : Widget "Listes de données"
- [ ] **Tâche 8.2.4** : Widget "Actions rapides"

---

## 🔵 PRIORITÉ MOYENNE (3-4 semaines)

### **9. Fonctionnalités Bonus**
**Statut :** ❌ Manquant | **Priorité :** 🔵 MOYENNE

#### **9.1 Connexion en Tant qu'Utilisateur**
- [ ] **Tâche 9.1.1** : Créer le système de "login as user"
- [ ] **Tâche 9.1.2** : Implémenter la sécurité et l'audit
- [ ] **Tâche 9.1.3** : Créer l'interface d'accompagnement
- [ ] **Tâche 9.1.4** : Ajouter les notifications de connexion

#### **9.2 Options de Livraison Variées**
- [ ] **Tâche 9.2.1** : Implémenter la livraison express
- [ ] **Tâche 9.2.2** : Ajouter la livraison à domicile
- [ ] **Tâche 9.2.3** : Créer la livraison en entreprise
- [ ] **Tâche 9.2.4** : Implémenter la livraison programmée

### **10. Optimisations de Performance**
**Statut :** ⚠️ Basique | **Priorité :** 🔵 MOYENNE

#### **10.1 Optimisations Frontend**
- [ ] **Tâche 10.1.1** : Implémenter le lazy loading des composants
- [ ] **Tâche 10.1.2** : Optimiser les images avec WebP
- [ ] **Tâche 10.1.3** : Ajouter le service worker pour le cache
- [ ] **Tâche 10.1.4** : Implémenter la compression des assets

#### **10.2 Optimisations Backend**
- [ ] **Tâche 10.2.1** : Optimiser les requêtes MongoDB
- [ ] **Tâche 10.2.2** : Implémenter le cache Redis
- [ ] **Tâche 10.2.3** : Ajouter la compression gzip
- [ ] **Tâche 10.2.4** : Optimiser les requêtes PostgreSQL

### **11. Tests et Qualité**
**Statut :** ⚠️ Basique | **Priorité :** 🔵 MOYENNE

#### **11.1 Tests Frontend**
- [ ] **Tâche 11.1.1** : Configurer Vitest pour les tests unitaires
- [ ] **Tâche 11.1.2** : Créer les tests pour les composants critiques
- [ ] **Tâche 11.1.3** : Implémenter les tests d'intégration
- [ ] **Tâche 11.1.4** : Ajouter les tests E2E avec Playwright

#### **11.2 Tests Backend**
- [ ] **Tâche 11.2.1** : Configurer Jest pour les tests
- [ ] **Tâche 11.2.2** : Créer les tests pour les contrôleurs
- [ ] **Tâche 11.2.3** : Implémenter les tests pour les services
- [ ] **Tâche 11.2.4** : Ajouter les tests de sécurité

---

## 📊 RÉSUMÉ DES PRIORITÉS

### **🔴 CRITIQUE (1-2 semaines)**
- Interface de gestion des alertes
- Recherche facettée complète
- Dashboard d'administration avancé
- Historique commandes complet

### **🟡 ÉLEVÉE (2-3 semaines)**
- Intégration PayPal
- Gestion livraison avancée
- Rôles utilisateurs spécialisés
- Widgets personnalisables

### **🔵 MOYENNE (3-4 semaines)**
- Fonctionnalités bonus
- Optimisations de performance
- Tests et qualité

---

## 🎯 ESTIMATION TEMPS TOTAL

- **Priorité Critique :** 1-2 semaines
- **Priorité Élevée :** 2-3 semaines  
- **Priorité Moyenne :** 3-4 semaines
- **Total estimé :** 6-9 semaines

---

## 📝 NOTES IMPORTANTES

### **Architecture Existante**
Le projet dispose déjà d'une architecture solide avec :
- ✅ Backend Node.js + Express + MongoDB + PostgreSQL
- ✅ Frontend Vue.js 3 + TypeScript + Vite
- ✅ Authentification sécurisée CNIL
- ✅ Intégration Stripe
- ✅ API La Poste basique
- ✅ Composants Vue.js avancés (DataTable, DeleteButton, etc.)

### **Dépendances**
La plupart des fonctionnalités manquantes sont des **interfaces utilisateur** pour des fonctionnalités backend déjà implémentées, ce qui facilite grandement le développement.

### **Recommandations**
1. **Commencer par les tâches critiques** pour avoir un MVP fonctionnel
2. **Tester chaque fonctionnalité** avant de passer à la suivante
3. **Documenter les nouvelles fonctionnalités** au fur et à mesure
4. **Maintenir la cohérence** avec l'architecture existante 