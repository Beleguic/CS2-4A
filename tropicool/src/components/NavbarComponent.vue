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
        <router-link v-if="!auth.isLoggedIn" to="/register" class="hover:text-white hover:bg-main px-5 py-3 rounded-full" active-class="text-white bg-main">S'inscrire</router-link>
        <router-link v-if="!auth.isLoggedIn" to="/login" class="hover:text-white hover:bg-main px-5 py-3 rounded-full" active-class="text-white bg-main">Connexion</router-link>
        <button v-if="auth.isLoggedIn" @click="logout" class="hover:text-white hover:bg-main px-5 py-3 rounded-full">Déconnexion</button>
        <img src="/Tropicool search.svg" alt="Search Icon" class="w-6 h-6" />
        <img src="/Tropicool logo.png" alt="User Icon" class="w-6 h-6" />
        <img src="/Panier Tropicool.png" alt="Panier Icon" class="w-6 h-6" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
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
      path: "Search",
      icon: "<svg width='16' height='17' viewBox='0 0 16 17' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M5.94286 0.5C7.519 0.5 9.03059 1.12612 10.1451 2.24062C11.2596 3.35512 11.8857 4.86671 11.8857 6.44286C11.8857 7.91486 11.3463 9.268 10.4594 10.3103L10.7063 10.5571H11.4286L16 15.1286L14.6286 16.5L10.0571 11.9286V11.2063L9.81029 10.9594C8.73176 11.8796 7.36059 12.3853 5.94286 12.3857C4.36671 12.3857 2.85512 11.7596 1.74062 10.6451C0.62612 9.53059 0 8.019 0 6.44286C0 4.86671 0.62612 3.35512 1.74062 2.24062C2.85512 1.12612 4.36671 0.5 5.94286 0.5ZM5.94286 2.32857C3.65714 2.32857 1.82857 4.15714 1.82857 6.44286C1.82857 8.72857 3.65714 10.5571 5.94286 10.5571C8.22857 10.5571 10.0571 8.72857 10.0571 6.44286C10.0571 4.15714 8.22857 2.32857 5.94286 2.32857Z' fill='currentColor'/></svg>"
    },
    {
      path: "Profile",
      icon: "<svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M10 0C11.3261 0 12.5979 0.526784 13.5355 1.46447C14.4732 2.40215 15 3.67392 15 5C15 6.32608 14.4732 7.59785 13.5355 8.53553C12.5979 9.47322 11.3261 10 10 10C8.67392 10 7.40215 9.47322 6.46447 8.53553C5.52678 7.59785 5 6.32608 5 5C5 3.67392 5.52678 2.40215 6.46447 1.46447C7.40215 0.526784 8.67392 0 10 0ZM10 12.5C15.525 12.5 20 14.7375 20 17.5V20H0V17.5C0 14.7375 4.475 12.5 10 12.5Z' fill='currentColor'/></svg>"
    },
    {
      path: "Cart",
      icon: "<svg width='18' height='20' viewBox='0 0 18 20' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M8.57143 11.4286C7.30849 11.4286 6.09728 10.9269 5.20425 10.0338C4.31122 9.14081 3.80952 7.9296 3.80952 6.66667H5.71429C5.71429 7.42443 6.01531 8.15115 6.55112 8.68697C7.08694 9.22279 7.81367 9.52381 8.57143 9.52381C9.32919 9.52381 10.0559 9.22279 10.5917 8.68697C11.1276 8.15115 11.4286 7.42443 11.4286 6.66667H13.3333C13.3333 7.9296 12.8316 9.14081 11.9386 10.0338C11.0456 10.9269 9.83436 11.4286 8.57143 11.4286ZM8.57143 1.90476C9.32919 1.90476 10.0559 2.20578 10.5917 2.7416C11.1276 3.27742 11.4286 4.00414 11.4286 4.7619H5.71429C5.71429 4.00414 6.01531 3.27742 6.55112 2.7416C7.08694 2.20578 7.81367 1.90476 8.57143 1.90476ZM15.2381 4.7619H13.3333C13.3333 4.13656 13.2102 3.51734 12.9709 2.9396C12.7315 2.36186 12.3808 1.83691 11.9386 1.39473C11.4964 0.952546 10.9715 0.601787 10.3937 0.362478C9.81599 0.12317 9.19677 0 8.57143 0C7.30849 0 6.09728 0.501699 5.20425 1.39473C4.31122 2.28776 3.80952 3.49897 3.80952 4.7619H1.90476C0.847619 4.7619 0 5.60952 0 6.66667V18.0952C0 18.6004 0.20068 19.0849 0.557892 19.4421C0.915104 19.7993 1.39959 20 1.90476 20H15.2381C15.7433 20 16.2278 19.7993 16.585 19.4421C16.9422 19.0849 17.1429 18.6004 17.1429 18.0952V6.66667C17.1429 6.16149 16.9422 5.67701 16.585 5.3198C16.2278 4.96258 15.7433 4.7619 15.2381 4.7619Z' fill='currentColor'/></svg>"
    },
  ]
</script>

<style scoped>
    .active-link {
        font-weight: bold;
    }
</style>
