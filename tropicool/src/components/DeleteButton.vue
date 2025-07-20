<template>
  <div class="delete-button-container">
    <!-- Bouton de suppression -->
    <button
      @click="showConfirmationModal = true"
      :disabled="isLoading"
      class="delete-btn"
      :class="buttonClass"
      :title="title"
    >
      <span v-if="isLoading" class="loading-spinner"></span>
      <img v-else :src="iconSrc" :alt="title" class="delete-icon" />
      <span v-if="showText" class="delete-text">{{ buttonText }}</span>
    </button>

    <!-- Modale de confirmation -->
    <div v-if="showConfirmationModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">⚠️ Confirmation de suppression</h3>
          <button @click="closeModal" class="modal-close" title="Fermer">
            <span>&times;</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="confirmation-message">
            <p class="warning-text">
              Êtes-vous sûr de vouloir supprimer cet élément ?
            </p>
            <p class="item-details" v-if="itemName">
              <strong>Élément :</strong> {{ itemName }}
            </p>
            <p class="warning-note">
              Cette action est irréversible et ne peut pas être annulée.
            </p>
          </div>

          <!-- Message d'erreur -->
          <div v-if="error" class="error-message">
            <span class="error-icon">❌</span>
            <span class="error-text">{{ error }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button
            @click="closeModal"
            :disabled="isLoading"
            class="modal-btn modal-btn-cancel"
          >
            Annuler
          </button>
          <button
            @click="confirmDelete"
            :disabled="isLoading"
            class="modal-btn modal-btn-confirm"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Suppression...' : 'Confirmer la suppression' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'vue-toast-notification';

// Props
interface Props {
  itemId?: string | number;
  itemName?: string;
  title?: string;
  buttonText?: string;
  showText?: boolean;
  variant?: 'danger' | 'warning' | 'default';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onConfirm?: (id?: string | number) => Promise<boolean>;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Supprimer',
  buttonText: 'Supprimer',
  showText: false,
  variant: 'danger',
  size: 'medium',
  disabled: false
});

// Emits
const emit = defineEmits<{
  confirmed: [id?: string | number];
  cancelled: [];
  error: [error: string];
}>();

// Composables
const $toast = useToast();

// État local
const showConfirmationModal = ref(false);
const isLoading = ref(false);
const error = ref('');

// Computed
const buttonClass = computed(() => ({
  [`delete-btn--${props.variant}`]: true,
  [`delete-btn--${props.size}`]: true,
  'delete-btn--loading': isLoading.value,
  'delete-btn--disabled': props.disabled
}));

const iconSrc = computed(() => {
  return '/src/assets/icons/trash.svg';
});

// Méthodes
const closeModal = () => {
  if (!isLoading.value) {
    showConfirmationModal.value = false;
    error.value = '';
    emit('cancelled');
  }
};

const confirmDelete = async () => {
  if (isLoading.value) return;

  isLoading.value = true;
  error.value = '';

  try {
    let success = false;

    if (props.onConfirm) {
      // Utiliser la fonction de callback fournie
      success = await props.onConfirm(props.itemId);
    } else {
      // Émettre l'événement pour que le parent gère la suppression
      emit('confirmed', props.itemId);
      success = true;
    }

    if (success) {
      // Succès
      $toast.open({
        message: 'Élément supprimé avec succès',
        type: 'success',
        position: 'bottom-left',
        duration: 3000
      });

      // Fermer la modale
      showConfirmationModal.value = false;
    } else {
      // Échec silencieux
      error.value = 'La suppression a échoué. Veuillez réessayer.';
    }
  } catch (err) {
    // Gestion d'erreur
    const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
    error.value = errorMessage;
    
    emit('error', errorMessage);
    
    $toast.open({
      message: errorMessage,
      type: 'error',
      position: 'bottom-left',
      duration: 5000
    });
  } finally {
    isLoading.value = false;
  }
};

// Exposer des méthodes pour utilisation externe
defineExpose({
  showModal: () => { showConfirmationModal.value = true; },
  hideModal: closeModal,
  setLoading: (loading: boolean) => { isLoading.value = loading; },
  setError: (errorMessage: string) => { error.value = errorMessage; }
});
</script>

<style scoped>
.delete-button-container {
  display: inline-block;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  background: transparent;
  color: #666;
}

.delete-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Variantes */
.delete-btn--danger {
  color: #dc3545;
}

.delete-btn--danger:hover:not(:disabled) {
  background: rgba(220, 53, 69, 0.1);
  color: #c82333;
}

.delete-btn--warning {
  color: #ffc107;
}

.delete-btn--warning:hover:not(:disabled) {
  background: rgba(255, 193, 7, 0.1);
  color: #e0a800;
}

.delete-btn--default {
  color: #666;
}

.delete-btn--default:hover:not(:disabled) {
  background: rgba(102, 102, 102, 0.1);
  color: #333;
}

/* Tailles */
.delete-btn--small {
  padding: 0.25rem;
  font-size: 0.75rem;
}

.delete-btn--medium {
  padding: 0.5rem;
  font-size: 0.875rem;
}

.delete-btn--large {
  padding: 0.75rem;
  font-size: 1rem;
}

.delete-icon {
  width: 16px;
  height: 16px;
  filter: currentColor;
}

.delete-text {
  white-space: nowrap;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Modale */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: #f8f9fa;
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.confirmation-message {
  margin-bottom: 1rem;
}

.warning-text {
  font-size: 1rem;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.item-details {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.warning-note {
  font-size: 0.875rem;
  color: #dc3545;
  font-weight: 500;
  margin: 0;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.error-icon {
  font-size: 1rem;
}

.error-text {
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #e9ecef;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.modal-btn-cancel {
  background: #6c757d;
  color: white;
}

.modal-btn-cancel:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-1px);
}

.modal-btn-confirm {
  background: #dc3545;
  color: white;
}

.modal-btn-confirm:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-btn {
    width: 100%;
  }
  
  .delete-btn--medium {
    padding: 0.75rem;
  }
  
  .delete-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 1.1rem;
  }
  
  .warning-text {
    font-size: 0.9rem;
  }
}
</style> 