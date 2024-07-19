import { defineStore } from 'pinia';
import axios, { AxiosError } from 'axios';
import router from '../router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: !!localStorage.getItem('token'),
    userId: localStorage.getItem('userId') || null,
    userRole: localStorage.getItem('userRole') || null,
  }),
  actions: {
    async login(email: string, password: string) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userId', response.data.userId);
          localStorage.setItem('userRole', response.data.role);
          this.isLoggedIn = true;
          this.userId = response.data.userId;
          this.userRole = response.data.role;
          console.log("Connexion réussie");
          router.push({ name: 'Home' });
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response) {
          const serverError = error.response.data.message || 'Une erreur de réseau est survenue';
          const loginAttempts = error.response.data.loginAttempts || 0;
          console.log(`Tentatives de connexion échouées: ${loginAttempts}`);

          if (error.response.data.forcePasswordChange) {
            alert("Votre mot de passe est expiré. Veuillez vérifier votre e-mail pour le réinitialiser.");
          }

          throw new Error('Login failed: ' + serverError);
        } else {
          throw new Error('Login failed: An unexpected error occurred');
        }
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      this.isLoggedIn = false;
      this.userId = null;
      this.userRole = null;
      console.log("Déconnexion réussie");
      router.push({ name: 'Login' });
    }
  }
});
