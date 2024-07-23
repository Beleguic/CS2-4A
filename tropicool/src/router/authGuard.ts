import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

export const verifyRole = async (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
  roles: string[]
) => {
  try {
    const auth = useAuthStore();
    if (auth.isLoggedIn) {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/check-role`, {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/check-role`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (roles.includes(response.data.role)) {
      if (roles.includes(response.data.role)) {
        next();
      } else {
        next({ name: 'Home' });
      }
    } else {
      next({ name: 'Login' });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle:', error);
    next({ name: 'Login' });
  }
};

export function isAuthenticated(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const auth = useAuthStore();
  if (auth.isLoggedIn === true) {
    next();
  } else {
    auth.logout();
    next({ name: 'Login' });
  }
}
