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
import PrivacyPolicy from '../views/PrivacyPolicy.vue';
// import axios from 'axios';
import { verifyAdmin } from '../router/authGuard';
import DBIndex from '../components/DBIndex.vue';
import FrontCategory from '../components/FrontCategory.vue';
import FrontCategoryDetails from '../components/FrontCategoryDetails.vue';
import Category from '../views/Category.vue';
import DBCategoryIndex from '../components/DBCategoryIndex.vue';
import DBCategoryEdit from '../components/DBCategoryEdit.vue';
import DBCategoryDelete from '../components/DBCategoryDelete.vue';
import DBCategoryNew from '../components/DBCategoryNew.vue';

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
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAdmin: true },
    beforeEnter: verifyAdmin,
    children: [
      {
        path: '/',
        name: 'DashboardIndex',
        component: DBIndex,
      },
      {
        path: 'category',
        name: 'DBCategoryIndex',
        component: DBCategoryIndex,
        children: [
          {
            path: 'edit/:id',
            name: 'DBCategoryEdit',
            component: DBCategoryEdit,
            props: true,
          },
          {
            path: 'delete/:id',
            name: 'DBCategoryDelete',
            component: DBCategoryDelete,
            props: true,
          },
          {
            path : 'new',
            name : 'DBCategoryNew',
            component : DBCategoryNew,
            props : true
          }
        ]
      },
    ]
  },
  {
    path: '/category',
    name: 'Category',
    component: Category,
    children: [
      {
        path: '',
        name: 'FrontCategory',
        component: FrontCategory
      },
      {
        path: ':id',
        name: 'FrontCategoryDetails',
        component: FrontCategoryDetails,
        props: true
      },
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;