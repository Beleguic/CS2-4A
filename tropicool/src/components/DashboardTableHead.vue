<template>
  <th v-if="column.label === 'Actions'" class="py-2 px-4 text-2xl bg-main text-white whitespace-nowrap sticky right-0">
    {{ column.label }}
  </th>
  <th v-else class="py-2 px-4 text-2xl bg-main text-white whitespace-nowrap">
    {{ column.label }}
  </th>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { defineProps } from 'vue';

  interface Column {
    key: string;
    label: string;
  }

  const props = defineProps<{ column: Column }>();
  const { column } = props;

  const thClasses = computed(() => {
    const baseClasses = 'py-2 px-4 text-2xl bg-main text-white whitespace-nowrap';
    const additionalClasses = column.label === 'Actions' ? 'sticky right-0 z-10' : '';
    return `${baseClasses} ${additionalClasses}`;
  });
</script>