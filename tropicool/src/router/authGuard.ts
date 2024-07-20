import { useAuthStore } from '../stores/authStore';

export const verifyAdmin = async (to, from, next) => {
  try {
    const auth = useAuthStore();
    if (auth.isLoggedIn) {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        next({ name: 'Login' });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-role`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify role');
      }

      const data = await response.json();

      if (data.role === 'admin') {
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