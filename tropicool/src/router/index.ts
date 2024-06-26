import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import VerifyAccount from '../views/VerifyAccount.vue';
import Dashboard from '../views/Dashboard.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import ResetPassword from '../views/ResetPassword.vue';
import Profile from '../views/Profile.vue';
import Product from '../views/Product.vue';
import PrivacyPolicy from '../views/PrivacyPolicy.vue'; // Assurez-vous que ce fichier existe
import axios from 'axios';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/verify-account',
    name: 'VerifyAccount',
    component: VerifyAccount,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAdmin: true },
    beforeEnter: async (to, from, next) => {
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
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
  },
  {
    path: '/logout',
    name: 'Logout',
    redirect: '/login',
    beforeEnter: async (to, from, next) => {
      const auth = useAuthStore();
      await auth.logout();
      next('/login');
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
  },
  {
    path: '/product',
    name: 'Product',
    component: Product,
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
