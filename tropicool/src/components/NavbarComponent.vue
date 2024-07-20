<template>
  <nav class="bg-gradient-to-b from-beige to-beige-transparent-80 flex justify-between items-center px-4 sticky top-0 left-0 w-full z-50">
    <div class="flex items-center w-2/6">
      <router-link :to="{ name: 'Home' }">
        <img src="/Tropicool preview.png" alt="Tropicool Logo" class="w-20 h-auto" />
      </router-link>
    </div>
    <div class="flex space-x-16 text-lg font-medium w-2/6 justify-center">
      <nav>
        <ul class="flex gap-4">
          <li v-for="(route, index) in routes" :key="index">
            <router-link :to="{ name: route.path }" active-class="text-white bg-main" class="text-main hover:text-white hover:bg-main px-5 py-3 rounded-full">
              {{ route.text }}
            </router-link>
          </li>
          <li v-if="canViewDashboard">
            <router-link :to="{ name: 'DashboardIndex' }" active-class="text-white bg-main" class="text-main hover:text-white hover:bg-main px-5 py-3 rounded-full">
              Dashboard
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
    <div class="flex items-center space-x-6 text-lg font-medium w-2/6 justify-end">
      <nav>
        <ul class="flex gap-4 items-center">
          <li>
            <button v-if="auth.isLoggedIn" @click="logout" class="flex items-center gap-2 px-4 py-2 text-main hover:bg-main hover:text-white rounded-full w-full">
              <component :is="iconLogout" class="w-full max-w-5" />
              <span class="text-sm">Se Déconnecter</span>
            </button>
          </li>
          <li v-for="(route, index) in routesIcon" :key="index">
            <router-link
              v-if="route.path !== 'Search'"
              :to="{ name: route.path }"
              active-class="text-white bg-main"
              class="inline-block px-4 py-2 text-main hover:bg-main hover:text-white rounded-full w-full"
            >
              <div class="flex gap-4 items-center relative">
                <component :is="route.icon" class="w-full max-w-5" />
              </div>
            </router-link>
            <button
              v-else
              @click="redirectToSearch"
              class="inline-block px-4 py-2 text-main hover:bg-main hover:text-white rounded-full w-full"
            >
              <div class="flex gap-4 items-center relative">
                <component :is="route.icon" class="w-full max-w-5" />
              </div>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

import iconSearch from '@/assets/icons/search.svg';
import iconProfile from '@/assets/icons/profile.svg';
import iconCart from '@/assets/icons/cart.svg';
import iconLogout from '@/assets/icons/logout.svg';

interface RouteIcon {
  path: string;
  icon: string;
}

const routesIcon: RouteIcon[] = [
  {
    path: 'Search',
    icon: iconSearch
  },
  {
    path: 'Profile',
    icon: iconProfile
  },
  {
    path: 'Cart',
    icon: iconCart
  },
];

interface Route {
  text: string;
  path: string;
}

const routes: Route[] = [
  {
    text: 'Accueil',
    path: 'Home',
  },
  {
    text: 'Produits',
    path: 'FrontProduct',
  },
  {
    text: 'Catégories',
    path: 'FrontCategory',
  },
];

const auth = useAuthStore();
const router = useRouter();

const allowedRoles = ['admin', 'store-keeper'];

const canViewDashboard = computed(() => {
  return auth.userRole !== null && allowedRoles.includes(auth.userRole);
});
const searchQuery = ref('');
const showSearch = ref(false);

function redirectToSearch() {
  router.push({ name: 'FrontProduct', query: { focus: 'search' } });
}

function logout() {
    auth.logout();
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #696BE2;
  color: #fff;
}

.nav-left, .nav-center, .nav-right {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
}

.nav-search-input {
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  width: 300px;
  margin-left: 10px;
  transition: width 0.3s ease-in-out;
  background-color: #ffffff; /* Couleur de fond blanche */
  color: #333; /* Couleur du texte */
}

.nav-right a {
  color: #fff;
  margin-left: 20px;
  text-decoration: none;
}

.nav-right a:hover {
  text-decoration: underline;
}

.nav-right button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-right button:hover {
  color: #fff;
}

.nav-right .flex {
  transition: all 0.3s ease-in-out;
}

.show-search .nav-right {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
</style>
