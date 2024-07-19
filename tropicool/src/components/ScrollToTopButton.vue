<template>
  <button v-if="visible" @click="scrollToTop" class="fixed bottom-4 right-4 bg-main text-white px-4 py-4 rounded-lg shadow-lg transition-all duration-300 hover:bg-secondary z-50">
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5363 18.4666H8.26354V4.83019L2.01354 11.0802L0.399902 9.46655L9.3999 0.466553L18.3999 9.46655L16.7863 11.0802L10.5363 4.83019V18.4666Z" fill="white"/>
    </svg>
  </button>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted } from 'vue';

  const visible = ref(false);

  const checkScroll = () => {
    visible.value = window.scrollY > 50;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  onMounted(() => {
    window.addEventListener('scroll', checkScroll);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', checkScroll);
  });
</script>