<template>
    <th class="py-2 px-4 text-2xl bg-main text-white">
        {{ column.label }}
    </th>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Column {
    key: string;
    label: string;
}

const props = defineProps<{ column: Column }>();
</script>

<style scoped>
/* Add any required styles here */
</style>
