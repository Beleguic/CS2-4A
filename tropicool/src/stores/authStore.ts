import { defineStore } from 'pinia';
import router from '../router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: !!localStorage.getItem('token'),
    userId: localStorage.getItem('userId') || null,
    userRole: localStorage.getItem('userRole') || null,
    isVerified: localStorage.getItem('isVerified') || null,
  }),
  actions: {
    async login(email: string, password: string) {
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
          const serverError = errorData.message || 'Une erreur de réseau est survenue';
          const loginAttempts = errorData.loginAttempts || 0;
          console.log(`Tentatives de connexion échouées: ${loginAttempts}`);

          if (errorData.forcePasswordChange) {
            alert("Votre mot de passe est expiré. Veuillez vérifier votre e-mail pour le réinitialiser.");
          }

          throw new Error('Login failed: ' + serverError);
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
          console.log("Connexion réussie");
          router.push({ name: 'Home' });
        }
      } catch (error) {
        console.error('Error during login:', error);
        throw new Error('Login failed: An unexpected error occurred');
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
      console.log("Déconnexion réussie");
      router.push({ name: 'Login' });
    }
  }
});
