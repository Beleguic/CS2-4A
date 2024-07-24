<template>
  <aside class="w-full max-w-80 bg-main p-4 h-full flex-shrink-0">
    <nav>
      <div :style="{ maxHeight: dynamicMaxHeight }" class="overflow-y-auto">
        <ul class="flex flex-col gap-4">
          <li v-for="(route, index) in filteredRoutes" :key="index">
            <router-link :to="{ name: route.path }"
              class="inline-block px-4 py-2 text-white hover:bg-secondary rounded w-full">
                <span>{{ route.text }}</span>
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
    roles: string[];
  }

  const routes: Route[] = [
    {
      text: "Mon Profil",
      path: "FrontProfile",
      roles: ['user', 'store-keeper', 'admin']
    },
    {
      text: "Mes Commandes",
      path: "FrontProfileOrders",
      roles: ['user', 'store-keeper', 'admin']
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
  .router-link-active.router-link-exact-active {
    background-color: #1D1F96;
  }
</style>