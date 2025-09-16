import { defineStore } from 'pinia';
import router from '../router';
import { useToast } from '../composables/useToast';
import type { User, LoginFormData } from '../types';

const toast = useToast();

export const useAuthStore = defineStore('auth', {
  state: (): {
    isLoggedIn: boolean;
    userId: string | null;
    userRole: string | null;
    isVerified: string | null;
    user: User | null;
  } => ({
    isLoggedIn: !!localStorage.getItem('token'),
    userId: localStorage.getItem('userId') || null,
    userRole: localStorage.getItem('userRole') || null,
    isVerified: localStorage.getItem('isVerified') || null,
    user: null,
  }),
  actions: {
    async login(email: string, password: string): Promise<void> {
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
          const errorMessage = errorData.message || 'Une erreur de réseau est survenue';

          if (errorData.forcePasswordChange) {
            toast.warning('Votre mot de passe est expiré. Veuillez vérifier votre e-mail pour le réinitialiser !');
            return;
          }

          toast.apiError(errorData, errorMessage);
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
          
          toast.success('Connexion réussie !');
          router.push({ name: 'Home' });
        }
      } catch (e) {
        toast.apiError(e, 'Erreur lors de la connexion');
      }
    },
    logout(): void {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isVerified');
      this.isLoggedIn = false;
      this.userId = null;
      this.userRole = null;
      this.isVerified = null;
      this.user = null;
      router.push({ name: 'Login' });
    }
  }
});
