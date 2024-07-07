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
import { verifyAdmin } from '../router/authGuard';
import DBIndex from '../components/DBIndex.vue';
import FrontCategory from '../components/FrontCategory.vue';
import FrontCategoryDetails from '../components/FrontCategoryDetails.vue';
import Category from '../views/Category.vue';
import DBCategoryIndex from '../components/DBCategoryIndex.vue';
import DBCategoryForm from '../views/DBCategoryForm.vue';
import DBAlertIndex from '../components/DBAlertIndex.vue';
import DBAlertForm from '../views/DBAlertForm.vue';
import DBProductIndex from '../components/DBProductIndex.vue';
import DBProductForm from '../views/DBProductForm.vue';
import DBAlertTypeIndex from '../components/DBAlertTypeIndex.vue';
import DBAlertTypeForm from '../views/DBAlertTypeForm.vue';
import DBCartIndex from '../components/DBCartIndex.vue';
import DBCartForm from '../views/DBCartForm.vue';
import DBCategoryProductIndex from '../components/DBCategoryProductIndex.vue';
import DBCategoryProductForm from '../views/DBCategoryProductForm.vue';
import DBNewsletterIndex from '../components/DBNewsletterIndex.vue';
import DBNewsletterForm from '../views/DBNewsletterForm.vue';
import DBOrderIndex from '../components/DBOrderIndex.vue';
import DBOrderForm from '../views/DBOrderForm.vue';
import DBProductPromotionIndex from '../components/DBProductPromotionIndex.vue';
import DBProductPromotionForm from '../views/DBProductPromotionForm.vue';
import DBPromotionCodeIndex from '../components/DBPromotionCodeIndex.vue';
import DBPromotionCodeForm from '../views/DBPromotionCodeForm.vue';
import DBStockIndex from '../components/DBStockIndex.vue';
import DBStockForm from '../views/DBStockForm.vue';
import DBUserIndex from '../components/DBUserIndex.vue';
import DBUserForm from '../views/DBUserForm.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
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
      // Category Routes
      {
        path: 'category',
        name: 'DBCategoryIndex',
        component: DBCategoryIndex,
      },
      {
        path: 'category/new',
        name: 'DBCategoryNew',
        component: DBCategoryForm,
        props: true,
      },
      {
        path: 'category/edit/:id',
        name: 'DBCategoryEdit',
        component: DBCategoryForm,
        props: true,
      },
      {
        path: 'category/delete/:id',
        name: 'DBCategoryDelete',
        component: DBCategoryForm,
        props: true,
      },
      // Alert Routes
      {
        path: 'alert',
        name: 'DBAlertIndex',
        component: DBAlertIndex,
      },
      {
        path: 'alert/new',
        name: 'DBAlertNew',
        component: DBAlertForm,
        props: true,
      },
      {
        path: 'alert/edit/:id',
        name: 'DBAlertEdit',
        component: DBAlertForm,
        props: true,
      },
      {
        path: 'alert/delete/:id',
        name: 'DBAlertDelete',
        component: DBAlertForm,
        props: true,
      },
      // Alert Type Routes
      {
        path: 'alert-types',
        name: 'DBAlertTypeIndex',
        component: DBAlertTypeIndex,
      },
      {
        path: 'alert-types/new',
        name: 'DBAlertTypeNew',
        component: DBAlertTypeForm,
        props: true,
      },
      {
        path: 'alert-types/edit/:id',
        name: 'DBAlertTypeEdit',
        component: DBAlertTypeForm,
        props: true,
      },
      {
        path: 'alert-types/delete/:id',
        name: 'DBAlertTypeDelete',
        component: DBAlertTypeForm,
        props: true,
      },
      // Product Routes
      {
        path: 'product',
        name: 'DBProductIndex',
        component: DBProductIndex,
      },
      {
        path: 'product/new',
        name: 'DBProductNew',
        component: DBProductForm,
        props: true,
      },
      {
        path: 'product/edit/:id',
        name: 'DBProductEdit',
        component: DBProductForm,
        props: true,
      },
      {
        path: 'product/delete/:id',
        name: 'DBProductDelete',
        component: DBProductForm,
        props: true,
      },
      // Cart Routes
      {
        path: 'cart',
        name: 'DBCartIndex',
        component: DBCartIndex,
      },
      {
        path: 'cart/new',
        name: 'DBCartNew',
        component: DBCartForm,
        props: true,
      },
      {
        path: 'cart/edit/:id',
        name: 'DBCartEdit',
        component: DBCartForm,
        props: true,
      },
      {
        path: 'cart/delete/:id',
        name: 'DBCartDelete',
        component: DBCartForm,
        props: true,
      },
      // Category Product Routes
      {
        path: 'category-product',
        name: 'DBCategoryProductIndex',
        component: DBCategoryProductIndex,
      },
      {
        path: 'category-product/new',
        name: 'DBCategoryProductNew',
        component: DBCategoryProductForm,
        props: true,
      },
      {
        path: 'category-product/edit/:id',
        name: 'DBCategoryProductEdit',
        component: DBCategoryProductForm,
        props: true,
      },
      {
        path: 'category-product/delete/:id',
        name: 'DBCategoryProductDelete',
        component: DBCategoryProductForm,
        props: true,
      },
      // Newsletter Routes
      {
        path: 'newsletter',
        name: 'DBNewsletterIndex',
        component: DBNewsletterIndex,
      },
      {
        path: 'newsletter/new',
        name: 'DBNewsletterNew',
        component: DBNewsletterForm,
        props: true,
      },
      {
        path: 'newsletter/edit/:id',
        name: 'DBNewsletterEdit',
        component: DBNewsletterForm,
        props: true,
      },
      {
        path: 'newsletter/delete/:id',
        name: 'DBNewsletterDelete',
        component: DBNewsletterForm,
        props: true,
      },
      // Order Routes
      {
        path: 'order',
        name: 'DBOrderIndex',
        component: DBOrderIndex,
      },
      {
        path: 'order/new',
        name: 'DBOrderNew',
        component: DBOrderForm,
        props: true,
      },
      {
        path: 'order/edit/:id',
        name: 'DBOrderEdit',
        component: DBOrderForm,
        props: true,
      },
      {
        path: 'order/delete/:id',
        name: 'DBOrderDelete',
        component: DBOrderForm,
        props: true,
      },
      // Product Promotion Routes
      {
        path: 'product-promotion',
        name: 'DBProductPromotionIndex',
        component: DBProductPromotionIndex,
      },
      {
        path: 'product-promotion/new',
        name: 'DBProductPromotionNew',
        component: DBProductPromotionForm,
        props: true,
      },
      {
        path: 'product-promotion/edit/:id',
        name: 'DBProductPromotionEdit',
        component: DBProductPromotionForm,
        props: true,
      },
      {
        path: 'product-promotion/delete/:id',
        name: 'DBProductPromotionDelete',
        component: DBProductPromotionForm,
        props: true,
      },
      // Promotion Code Routes
      {
        path: 'promotion-code',
        name: 'DBPromotionCodeIndex',
        component: DBPromotionCodeIndex,
      },
      {
        path: 'promotion-code/new',
        name: 'DBPromotionCodeNew',
        component: DBPromotionCodeForm,
        props: true,
      },
      {
        path: 'promotion-code/edit/:id',
        name: 'DBPromotionCodeEdit',
        component: DBPromotionCodeForm,
        props: true,
      },
      {
        path: 'promotion-code/delete/:id',
        name: 'DBPromotionCodeDelete',
        component: DBPromotionCodeForm,
        props: true,
      },
      // Stock Routes
      {
        path: 'stock',
        name: 'DBStockIndex',
        component: DBStockIndex,
      },
      {
        path: 'stock/new',
        name: 'DBStockNew',
        component: DBStockForm,
        props: true,
      },
      {
        path: 'stock/edit/:id',
        name: 'DBStockEdit',
        component: DBStockForm,
        props: true,
      },
      {
        path: 'stock/delete/:id',
        name: 'DBStockDelete',
        component: DBStockForm,
        props: true,
      },
      // User Routes
      {
        path: 'user',
        name: 'DBUserIndex',
        component: DBUserIndex,
      },
      {
        path: 'user/new',
        name: 'DBUserNew',
        component: DBUserForm,
        props: true,
      },
      {
        path: 'user/edit/:id',
        name: 'DBUserEdit',
        component: DBUserForm,
        props: true,
      },
      {
        path: 'user/delete/:id',
        name: 'DBUserDelete',
        component: DBUserForm,
        props: true,
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
