<template>
  <li class="bg-white border border-main rounded-sm p-5 w-full transition-all">
    <article class="grid grid-cols-1 gap-4">
      <img class="w-full h-full aspect-square" :src="image" :alt="`Produits dans la catégorie ${name} tropicool`">
      <div>
        <router-link :to="{ name: path, params: { id: url } }"
          class="text-white inline-block bg-main hover:bg-secondary px-4 py-2 rounded-sm">
          <span class="capitalize">{{ name }}</span>
        </router-link>
      </div>
    </article>
  </li>
</template>

<script setup lang="ts">
  import { defineProps } from 'vue';

  interface TableProps {
    name: string;
    image: string;
    path: string;
    url: string;
  }

  const props = defineProps<TableProps>();

  const { name, image, path, url } = props;
</script>