# Migration vers le nouveau système de toasts

## Résumé des changements

J'ai créé un système de toasts amélioré qui standardise l'utilisation de `useToast` dans toute l'application. Voici ce qui a été fait :

### 1. Nouveau composable `useToast.ts`

- **API simplifiée** : `toast.success()`, `toast.error()`, etc.
- **Méthodes spécialisées** : `toast.apiError()`, `toast.saved()`, `toast.deleted()`, etc.
- **Durées standardisées** : Configuration cohérente des durées d'affichage
- **Support TypeScript** : Typage complet

### 2. `useErrorHandler` amélioré

- Utilise maintenant le nouveau `useToast` en interne
- Expose l'objet `toast` complet pour plus de flexibilité
- API simplifiée pour la gestion d'erreurs

### 3. Avantages du nouveau système

- **Cohérence** : Même configuration partout
- **Simplicité** : API plus intuitive
- **Maintenabilité** : Configuration centralisée
- **Flexibilité** : Méthodes spécialisées pour des cas d'usage courants

## Exemples de migration

### Avant (ancien système)
```typescript
import { useToast } from 'vue-toast-notification';

const $toast = useToast();

$toast.open({
  message: 'Erreur! Veuillez recommencer!',
  type: 'error',
  position: 'bottom-left',
});
```

### Après (nouveau système)
```typescript
import { useToast } from '../composables/useToast';

const toast = useToast();
toast.error('Erreur! Veuillez recommencer!');
```

### Ou avec useErrorHandler
```typescript
import { useErrorHandler } from '../composables/useErrorHandler';

const { toast } = useErrorHandler();
toast.apiError(error, 'Erreur! Veuillez recommencer!');
```

## Fichiers déjà migrés

- ✅ `tropicool/src/composables/useErrorHandler.ts`
- ✅ `tropicool/src/composables/useToast.ts`
- ✅ `tropicool/src/views/Login.vue`
- ✅ `tropicool/src/components/FrontProduct.vue` (partiellement)

## Fichiers à migrer

Voici les fichiers qui utilisent encore l'ancien système et qui devraient être migrés :

1. `tropicool/src/views/ForgotPassword.vue`
2. `tropicool/src/views/Profile.vue`
3. `tropicool/src/views/Register.vue`
4. `tropicool/src/views/VerifyAccount.vue`
5. `tropicool/src/views/ResetPassword.vue`
6. `tropicool/src/views/ProductDetail.vue`
7. `tropicool/src/views/Cart.vue`
8. `tropicool/src/views/AddAlert.vue`
9. `tropicool/src/components/CartResume.vue`
10. `tropicool/src/components/CartTable.vue`
11. `tropicool/src/composables/useCartCheck.ts`
12. `tropicool/src/composables/useAddToCartFormValidation.ts`

## Guide de migration

### Étape 1 : Remplacer l'import
```typescript
// Avant
import { useToast } from 'vue-toast-notification';

// Après
import { useToast } from '../composables/useToast';
// ou
import { useErrorHandler } from '../composables/useErrorHandler';
```

### Étape 2 : Remplacer l'utilisation
```typescript
// Avant
const $toast = useToast();
$toast.open({
  message: 'Message',
  type: 'success',
  position: 'bottom-left',
});

// Après
const toast = useToast();
toast.success('Message');
```

### Étape 3 : Utiliser les méthodes spécialisées
```typescript
// Pour les erreurs d'API
toast.apiError(error, 'Message par défaut');

// Pour les actions CRUD
toast.saved('Données');
toast.deleted('Élément');
toast.updated('Profil');

// Pour les erreurs spécifiques
toast.validationError('Erreur de validation');
toast.networkError();
toast.unauthorized();
toast.notFound('Ressource');
```

## Configuration des durées

Le nouveau système utilise des durées optimisées :

- **Erreurs** : 5000ms
- **Succès** : 3000ms
- **Avertissements** : 4000ms
- **Informations** : 3000ms
- **Erreurs réseau** : 6000ms
- **Chargement** : 2000ms

## Avantages de la migration

1. **Code plus propre** : Moins de code répétitif
2. **Cohérence** : Même style partout
3. **Maintenabilité** : Configuration centralisée
4. **Flexibilité** : Méthodes spécialisées
5. **TypeScript** : Support complet du typage
6. **Performance** : Durées optimisées

## Prochaines étapes

1. Migrer tous les fichiers listés ci-dessus
2. Tester l'application pour s'assurer que tout fonctionne
3. Supprimer les anciens imports `vue-toast-notification` si plus utilisés
4. Documenter les nouvelles pratiques dans le README
