import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import router from '../router';

export const verifyAdmin = async (to, from, next) => {
  try {
    const auth = useAuthStore();
    if (auth.isLoggedIn) {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/check-role`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.role === 'admin') {
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
  console.log('bbauth :', auth.isLoggedIn)
  if (auth.isLoggedIn = true) {
    next();
  } else {
    console.log('bauth :', auth.isLoggedIn)
    router.push("Logout")
    auth.logout();
    console.log('aauth :', auth.isLoggedIn)
  }
}