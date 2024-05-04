import { createRouter, createWebHistory, RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import VerifyAccount from '../views/VerifyAccount.vue';
import Dashboard from '../views/Dashboard.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import ResetPassword from '../views/ResetPassword.vue';

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
    meta: { requiresAdmin: true }
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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


// Navigation guard pour protéger les routes nécessitant une authentification
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = localStorage.getItem('token');

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
