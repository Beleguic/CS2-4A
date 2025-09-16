<template>
  <div v-if="loading" class="flex items-center justify-center p-8">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-main"></div>
    <span class="ml-2 text-gray-600">Chargement...</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean;
}

defineProps<Props>();
</script>
