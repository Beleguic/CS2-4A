<template>
  <div class="flex w-9/12 mx-auto my-4 gap-4">
    <FrontProfileSidebar />
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
  import FrontProfileSidebar from '../components/FrontProfileSidebar.vue';
</script>