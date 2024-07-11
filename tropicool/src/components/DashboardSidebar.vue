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
      <div class="overflow-y-auto max-h-[585px]">
        <ul class="flex flex-col gap-4">
          <li v-for="(route, index) in routes" :key="index">
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
interface Route {
  text: string;
  path: string;
  icon: string;
}

import iconDashboard from '@/assets/icons/dashboard.svg';
import iconPromotionCode from '@/assets/icons/promotion-code.svg';

const routes: Route[] = [
    {
      text: "Dashboard",
      path: "Dashboard",
      icon: iconDashboard
    },
    {
      text: "Categories",
      path: "DBCategoryIndex",
      icon: iconDashboard
    },
    {
      text: "Alerts",
      path: "DBAlertIndex",
      icon: iconDashboard
    },
    {
      text: "Products",
      path: "DBProductIndex",
      icon: iconDashboard
    },
    {
      text: "Alert Types",
      path: "DBAlertTypeIndex",
      icon: iconDashboard
    },
    {
      text: "Carts",
      path: "DBCartIndex",
      icon: iconDashboard
    },
    {
      text: "Orders",
      path: "DBOrderIndex",
      icon: iconDashboard
    },
    {
      text: "Newsletters",
      path: "DBNewsletterIndex",
      icon: iconDashboard
    },
    {
      text: "Stocks",
      path: "DBStockIndex",
      icon: iconDashboard
    },
    {
      text: "Category Product",
      path: "DBCategoryProductIndex",
      icon: iconDashboard
    },
    {
      text: "User",
      path: "DBUserIndex",
      icon: iconDashboard
    },
    {
      text: "Product Promotion",
      path: "DBProductPromotionIndex",
      icon: iconDashboard
    },
    {
      text: "Promotion code",
      path: "DBPromotionCodeIndex",
      icon: iconPromotionCode,
    },
];

</script>

<style scoped>
  .router-link-active,
  .router-link-exact-active {
    background-color: #1D1F96;
  }
</style>
