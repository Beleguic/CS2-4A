<template>
  <header class="top-0 left-0 sticky w-full flex justify-end py-4 px-6 border-b border-b-gray-200 items-center bg-white">
    <div class="relative">
      <button @click="toggleMenu" class="group text-white rounded-md flex items-center gap-4 px-4 py-2"
        :class="[isMenuVisible ? 'bg-secondary hover:bg-main' : 'bg-main hover:bg-secondary']">
        <div>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.66992 0.5C9.73079 0.5 10.7482 0.921427 11.4983 1.67157C12.2485 2.42172 12.6699 3.43913 12.6699 4.5C12.6699 5.56087 12.2485 6.57828 11.4983 7.32843C10.7482 8.07857 9.73079 8.5 8.66992 8.5C7.60906 8.5 6.59164 8.07857 5.84149 7.32843C5.09135 6.57828 4.66992 5.56087 4.66992 4.5C4.66992 3.43913 5.09135 2.42172 5.84149 1.67157C6.59164 0.921427 7.60906 0.5 8.66992 0.5ZM8.66992 10.5C13.0899 10.5 16.6699 12.29 16.6699 14.5V16.5H0.669922V14.5C0.669922 12.29 4.24992 10.5 8.66992 10.5Z"
              fill="white" />
          </svg>
        </div>
        <span>Account</span>
        <div class="transition-all"
          :class="[isMenuVisible ? 'rotate-180 group-hover:rotate-0' : 'group-hover:rotate-180']">
          <svg width="11" height="7" viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.669922 0.9175L5.83492 6.0825L10.9999 0.9175H0.669922Z" fill="white" />
          </svg>
        </div>
      </button>
      <ul v-if="isMenuVisible"
        class="mt-2 py-2 flex flex-col gap-2 border border-gray-200 z-50 absolute bg-white w-full rounded-md">
        <li>
          <router-link :to="{ name: 'Profile' }"
            class="inline-block px-4 py-2 text-black hover:bg-main hover:text-white w-full">
            <div class="flex gap-4 items-center">
              <component :is="iconProfile" class="w-full max-w-5"/>
              <span>Profile</span>
            </div>
          </router-link>
        </li>
        <li>
          <button v-if="auth.isLoggedIn" @click="logout" class="inline-block px-4 py-2 text-black hover:bg-main hover:text-white w-full">
            <div class="flex gap-4 items-center">
              <component :is="iconLogout" class="w-full max-w-5"/>
              <span>Logout</span>
            </div>
          </button>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import iconProfile from '../assets/icons/db-profile.svg';
  import iconLogout from '../assets/icons/db-logout.svg';
  import { useAuthStore } from '../stores/authStore';

  const auth = useAuthStore();

  function logout() {
      auth.logout();
  }

  const isMenuVisible = ref<boolean>(false);

  const toggleMenu = () => {
    isMenuVisible.value = !isMenuVisible.value;
  };
</script>