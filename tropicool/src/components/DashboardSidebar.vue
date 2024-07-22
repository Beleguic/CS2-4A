<template>
  <aside class="w-full max-w-80 bg-main z-50 p-4 h-full flex-shrink-0 fixed inset-y-0">
    <nav>
      <ul class="mb-8">
        <li>
          <router-link :to="{ name: 'Home' }"
            class="inline-block px-4 py-2 text-white hover:bg-secondary rounded w-full">
            <div class="flex gap-4 items-center">
              <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 16V5.33333L7.11111 0L14.2222 5.33333V16H8.88889V9.77778H5.33333V16H0Z" fill="white" />
              </svg>
              <span>Go to Home</span>
            </div>
          </router-link>
        </li>
      </ul>
      <div :style="{ maxHeight: dynamicMaxHeight }" class="overflow-y-auto">
        <ul class="flex flex-col gap-4">
          <li v-for="(route, index) in filteredRoutes" :key="index">
            <router-link :to="{ name: route.path }"
              class="inline-block px-4 py-2 text-white hover:bg-secondary rounded w-full">
              <div class="flex gap-4 items-center">
                <component :is="route.icon" class="w-full max-w-5" />
                <span>{{ route.text }}</span>
              </div>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useAuthStore } from '../stores/authStore';

  interface Route {
    text: string;
    path: string;
    icon: string;
    roles: string[];
  }

  import iconDashboard from '@/assets/icons/dashboard.svg';
  import iconPromotionCode from '@/assets/icons/promotion-code.svg';
  import iconProfile from '@/assets/icons/profile.svg';
  import iconCategory from '@/assets/icons/category.svg';
  import iconProduct from '@/assets/icons/product.svg';
  import iconCart from '@/assets/icons/cart.svg';
  import iconOrder from '@/assets/icons/order.svg';
  import iconAlert from '@/assets/icons/alert.svg';
  import iconNewsletter from '@/assets/icons/newsletter.svg';
  import iconStock from '@/assets/icons/stock.svg';

  const routes: Route[] = [
    {
      text: "Dashboard",
      path: "Dashboard",
      icon: iconDashboard,
      roles: ['admin', 'store-keeper']
    },
    {
      text: "Commandes",
      path: "DBOrderIndex",
      icon: iconOrder,
      roles: ['admin']
    },
    {
      text: "Produits",
      path: "DBProductIndex",
      icon: iconProduct,
      roles: ['admin']
    },
    {
      text: "Utilisateurs",
      path: "DBUserIndex",
      icon: iconProfile,
      roles: ['admin']
    },
    {
      text: "Catégories",
      path: "DBCategoryIndex",
      icon: iconCategory,
      roles: ['admin']
    },
    {
      text: "Paniers",
      path: "DBCartIndex",
      icon: iconCart,
      roles: ['admin']
    },
    {
      text: "Alertes",
      path: "DBAlertIndex",
      icon: iconAlert,
      roles: ['admin']
    },
    {
      text: "Types d'Alertes",
      path: "DBAlertTypeIndex",
      icon: iconAlert,
      roles: ['admin']
    },
    {
      text: "Newsletters",
      path: "DBNewsletterIndex",
      icon: iconNewsletter,
      roles: ['admin']
    },
    {
      text: "Stocks",
      path: "DBStockIndex",
      icon: iconStock,
      roles: ['admin', 'store-keeper']
    },
    {
      text: "Catégories de Produits",
      path: "DBCategoryProductIndex",
      icon: iconCategory,
      roles: ['admin']
    },
    {
      text: "Promos de Produits",
      path: "DBProductPromotionIndex",
      icon: iconPromotionCode,
      roles: ['admin']
    },
    {
      text: "Codes Promo",
      path: "DBPromotionCodeIndex",
      icon: iconPromotionCode,
      roles: ['admin']
    },
  ];

  const dynamicMaxHeight = ref('calc(100vh - 115px)');

  const updateHeight = () => {
    dynamicMaxHeight.value = `calc(100vh - 115px)`;
  };

  onMounted(() => {
    window.addEventListener('resize', updateHeight);
    updateHeight();
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateHeight);
  });

  const auth = useAuthStore();

  const filteredRoutes = computed(() => {
    return routes.filter(route => route.roles.includes(auth.userRole ?? ''));
  });
</script>

<style scoped>
  .router-link-active,
  .router-link-exact-active {
    background-color: #1D1F96;
  }
</style>