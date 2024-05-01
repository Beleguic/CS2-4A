// src/stores/authStore.ts
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAllowedVerificationAttempt: false,
    user: null
  }),
  actions: {
    verifyToken(token: string) {
      fetch(`${import.meta.env.VITE_API_URL}/verify/${token}`)
        .then(response => response.json())
        .then(data => {
          if (data.message === 'Compte vérifié avec succès!') {
            this.isAllowedVerificationAttempt = false;
            alert('Compte vérifié avec succès!');
          } else {
            throw new Error(data.message);
          }
        })
        .catch(error => {
          console.error('Verification failed:', error);
        });
    },
    allowVerification() {
      this.isAllowedVerificationAttempt = true;
    }
  }
});
