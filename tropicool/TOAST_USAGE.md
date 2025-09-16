# Guide d'utilisation des Toasts

## Vue d'ensemble

Le système de toasts a été amélioré pour standardiser l'affichage des messages dans toute l'application. Il existe deux façons d'utiliser les toasts :

1. **useToast** - Pour une utilisation directe et flexible
2. **useErrorHandler** - Pour une gestion d'erreurs standardisée

## Utilisation de useToast

```typescript
import { useToast } from '../composables/useToast';

const toast = useToast();

// Toasts de base
toast.success('Opération réussie !');
toast.error('Une erreur est survenue');
toast.warning('Attention !');
toast.info('Information');

// Méthodes spécialisées
toast.apiError(error, 'Message par défaut');
toast.validationError('Erreur de validation');
toast.networkError();
toast.unauthorized();
toast.notFound('Produit');
toast.saved('Commande');
toast.deleted('Produit');
toast.updated('Profil');
toast.loading('Chargement...');
```

## Utilisation de useErrorHandler

```typescript
import { useErrorHandler } from '../composables/useErrorHandler';

const { handleError, handleSuccess, handleWarning, handleInfo, toast } = useErrorHandler();

// Gestion d'erreurs standardisée
handleError(error, 'Message par défaut');
handleSuccess('Succès !');
handleWarning('Attention !');
handleInfo('Information');

// Accès direct au toast pour plus de flexibilité
toast.apiError(error);
toast.saved('Données');
```

## Configuration des durées

- **Erreurs** : 5000ms (5 secondes)
- **Succès** : 3000ms (3 secondes)
- **Avertissements** : 4000ms (4 secondes)
- **Informations** : 3000ms (3 secondes)
- **Erreurs réseau** : 6000ms (6 secondes)
- **Chargement** : 2000ms (2 secondes)

## Exemples d'utilisation

### Dans un composant Vue

```vue
<template>
  <div>
    <button @click="saveData">Sauvegarder</button>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast';

const toast = useToast();

const saveData = async () => {
  try {
    await api.saveData();
    toast.saved('Données');
  } catch (error) {
    toast.apiError(error, 'Erreur lors de la sauvegarde');
  }
};
</script>
```

### Dans un store Pinia

```typescript
import { defineStore } from 'pinia';
import { useToast } from '../composables/useToast';

export const useMyStore = defineStore('myStore', {
  actions: {
    async fetchData() {
      const toast = useToast();
      
      try {
        const data = await api.getData();
        toast.success('Données chargées');
        return data;
      } catch (error) {
        toast.apiError(error, 'Erreur lors du chargement');
        throw error;
      }
    }
  }
});
```

### Gestion d'erreurs API

```typescript
import { useErrorHandler } from '../composables/useErrorHandler';

const { toast } = useErrorHandler();

// Gestion automatique des erreurs API
const response = await fetch('/api/data');
if (!response.ok) {
  const errorData = await response.json();
  toast.apiError(errorData, 'Erreur lors de la récupération des données');
  return;
}
```

## Migration depuis l'ancien système

### Avant
```typescript
import { useToast } from 'vue-toast-notification';

const $toast = useToast();

$toast.open({
  message: 'Message',
  type: 'success',
  position: 'bottom-left',
});
```

### Après
```typescript
import { useToast } from '../composables/useToast';

const toast = useToast();
toast.success('Message');
```

## Avantages du nouveau système

1. **Standardisation** : Configuration cohérente des toasts
2. **Simplicité** : API plus simple et intuitive
3. **Flexibilité** : Méthodes spécialisées pour des cas d'usage courants
4. **Maintenabilité** : Configuration centralisée
5. **TypeScript** : Support complet du typage
6. **Durées optimisées** : Durées adaptées au type de message

## Bonnes pratiques

1. Utilisez `toast.apiError()` pour les erreurs d'API
2. Utilisez `toast.validationError()` pour les erreurs de validation
3. Utilisez `toast.saved()`, `toast.deleted()`, `toast.updated()` pour les actions CRUD
4. Utilisez `toast.networkError()` pour les erreurs de connexion
5. Utilisez `toast.unauthorized()` pour les erreurs d'authentification
6. Gardez les messages courts et clairs
7. Évitez les toasts redondants
