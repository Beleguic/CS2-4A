import { defineStore } from 'pinia';
import router from '../router';
import { useToast } from 'vue-toast-notification';
const $toast = useToast();

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: !!localStorage.getItem('token'),
    userId: localStorage.getItem('userId') || null,
    userRole: localStorage.getItem('userRole') || null,
    isVerified: localStorage.getItem('isVerified') === 'true' || null,
  }),
  actions: {
    async login(email, password) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.forcePasswordChange) {
            $toast.open({
              message: 'Votre mot de passe est expiré. Veuillez vérifier votre e-mail pour le réinitialiser !',
              type: 'error',
              position: 'bottom-left',
            });
          } else {
            $toast.open({
              message: errorData.message || 'Une erreur est survenue, veuillez recommencer !',
              type: 'error',
              position: 'bottom-left',
            });
          }
          return;
        }

        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('userRole', data.role);
          localStorage.setItem('isVerified', data.isVerified);

          this.isLoggedIn = true;
          this.userId = data.userId;
          this.userRole = data.role;
          this.isVerified = data.isVerified;

          $toast.open({
            message: 'Connexion réussie !',
            type: 'success',
            position: 'bottom-left',
          });
          router.push({ name: 'Home' });
        }
      } catch (e) {
        $toast.open({
          message: 'Erreur, veuillez recommencer !',
          type: 'error',
          position: 'bottom-left',
        });
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isVerified');

      this.isLoggedIn = false;
      this.userId = null;
      this.userRole = null;
      this.isVerified = null;

      $toast.open({
        message: 'Déconnexion réussie !',
        type: 'success',
        position: 'bottom-left',
      });
      router.push({ name: 'Login' });
    }
  }
});
