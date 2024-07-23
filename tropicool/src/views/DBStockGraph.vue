<template>
    <div>
      <StockChart :idStock="route.params.id" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRoute } from 'vue-router';
  import StockChart from './../components/DBStockChart.vue';

  const route = useRoute();

  </script>
  
  <style>
  /* Ajoutez des styles spécifiques à cette vue si nécessaire */
  </style>
  