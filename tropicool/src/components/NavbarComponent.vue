<template>
  <nav class="bg-gradient-to-b from-beige to-beige-transparent-80 flex justify-between items-center px-4 sticky top-0 left-0 w-full z-50">
    <div class="flex items-center w-2/6">
      <router-link :to="{ name: 'Home' }">
        <img src="/Tropicool preview.png" alt="Tropicool Logo" class="w-20 h-auto" />
      </router-link>
    </div>
    <div class="flex space-x-16 text-lg font-medium w-2/6 justify-center">
        <router-link to="/" class="hover:text-white hover:bg-main px-5 py-3 rounded-full" active-class="text-white bg-main">Accueil</router-link>
        <router-link to="/product" class="hover:text-white hover:bg-main px-5 py-3 rounded-full" active-class="text-white bg-main">Produit</router-link>
        <router-link to="/merch" class="hover:text-white hover:bg-main px-5 py-3 rounded-full" active-class="text-white bg-main">Merch</router-link>
    </div>
    <div class="flex items-center space-x-6 text-lg font-medium w-2/6 justify-end">
      <nav>
        <ul class="flex gap-4">
          <li v-for="(route, index) in routesIcon" :key="index">
            <router-link
              v-if="route.path !== 'Profile' || !isAuthenticated"
              :to="{ name: route.path }"
              active-class="text-white bg-main"
              class="inline-block px-4 py-2 text-main hover:bg-main hover:text-white rounded-full w-full"
            >
              <div class="flex gap-4 items-center relative">
                <component :is="route.icon" class="w-full max-w-5" />
              </div>
            </router-link>
            <div v-else class="relative inline-block">
              <button
                @click="toggleProfileMenu"
                class="inline-block px-4 py-2 text-main hover:bg-main hover:text-white rounded-full w-full"
              >
                <div class="flex gap-4 items-center relative">
                  <component :is="route.icon" class="w-full max-w-5" />
                </div>
              </button>
              <div v-if="showProfileMenu" class="absolute top-full -left-full bg-white shadow-lg rounded-md mt-2">
                <ul>
                  <li>
                    <router-link
                      :to="{ name: 'Profile' }"
                      active-class="text-white bg-main"
                      class="whitespace-nowrap block px-4 py-2 text-main hover:bg-main hover:text-white rounded-t-md"
                      @click="closeProfileMenu"
                    >
                      Profile
                    </router-link>
                  </li>
                  <li v-if="isAuthenticated">
                    <router-link
                      :to="{ name: 'Logout' }"
                      class="whitespace-nowrap block px-4 py-2 text-main hover:bg-main hover:text-white rounded-b-md w-full text-left"
                    >
                      <span>Se déconnecter</span>
                    </router-link>
                  </li>
                  <li v-else>
                    <router-link
                      :to="{ name: 'Login' }"
                      class="whitespace-nowrap block px-4 py-2 text-main hover:bg-main hover:text-white rounded-b-md w-full text-left"
                    >
                      <span>Se déconnecter</span>
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';

    const auth = useAuthStore();

    function logout() {
        auth.logout();
    }

  interface Route {
    path: string;
    icon: string;
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

const isAuthenticated = ref(false);
const showProfileMenu = ref(false);

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  isAuthenticated.value = authStore.isLoggedIn;
});

authStore.$subscribe(() => {
  isAuthenticated.value = authStore.isLoggedIn;
});

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
};

const closeProfileMenu = () => {
  showProfileMenu.value = false;
};

const logout = async () => {
  await authStore.logout();
  closeProfileMenu();
  router.push({ name: 'Login' });
};
</script>