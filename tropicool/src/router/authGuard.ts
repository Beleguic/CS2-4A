import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const verifyRole = async (to, from, next, roles) => {
  try {
    const auth = useAuthStore();
    if (auth.isLoggedIn) {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/check-role`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

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

export function isAuthenticated(to, from, next) {
  const auth = useAuthStore();
  if (auth.isLoggedIn === true) {
    next();
  } else {
    auth.logout();
    next({ name: 'Login' });
  }
}
