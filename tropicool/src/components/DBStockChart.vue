<template>
    <section class="bg-white">
        <div class="container mx-auto py-12 px-8">
            <div class="flex items-center justify-between mb-12">
                <h1 class="text-4xl font-bold text-gray-800">
                    Évolution des stocks pour le produit : {{ productName }}
                </h1>
                <router-link 
                    :to="{ name: 'DBStockIndex' }" 
                    class="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg shadow-md transition duration-300">
                    Retour
                </router-link>
            </div>
            <div class="bg-gray-100 rounded-lg shadow-lg p-8">
                <div class="flex justify-center">
                    <canvas id="stockChart" class="w-full max-w-4xl" height="400"></canvas>
                </div>
            </div>
        </div>
    </section>
</template>

  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { Chart, registerables } from 'chart.js';
  import axios from 'axios';
  
  Chart.register(...registerables);

  const apiUrl = import.meta.env.VITE_API_URL as string;
  const productName = ref<string>('');
  
  interface StockOperation {
    date: string;
    quantity: number;
  }
  
  interface Props {
    idStock: string;
  }

  interface Stock {
    id: string;
    product: {
        id: string;
        name: string;
    };
    quantity: number;
    status: string;
    created_at: string;
    difference: string;
}
  
  const props = defineProps<Props>();
  
  const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Stock',
      backgroundColor: 'rgba(54, 162, 235, 0.2)', 
      borderColor: 'rgba(54, 162, 235, 1)', 
      borderWidth: 1,
      data: [] as number[],
      hoverBackgroundColor: 'rgba(54, 162, 235, 0.4)',
      hoverBorderColor: 'rgba(54, 162, 235, 1)', 
    }
  ]
});
  
  const options = ref({
    responsive: true,
    maintainAspectRatio: false
  });
  
  const fetchStockData = async () => {
    try {

        const responseProduit = await axios.get<Stock[]>(`${apiUrl}/stock/${props.idStock}`);
        
        let productId = responseProduit.data.product.id;
        productName.value = responseProduit.data.product.name;

      const response = await axios.get<StockOperation[]>(`${apiUrl}/stock/store-keeper/graph/${productId}`);
      const operations = response.data;
      console.log(operations); // Debug: afficher les données de l'API
  
      if (Array.isArray(operations)) {
        chartData.value.labels = operations.map(op => new Date(op.date).toLocaleDateString());
        chartData.value.datasets[0].data = operations.map(op => op.quantity);
        renderChart();
      } else {
        console.error('La réponse de l\'API n\'est pas un tableau:', operations);
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };
  
  const renderChart = () => {
    const ctx = (document.getElementById('stockChart') as HTMLCanvasElement).getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: chartData.value,
      options: options.value
    });
  };
  
  onMounted(() => {
    fetchStockData();
  });
  
  watch(() => props.productId, fetchStockData);
  </script>
  
  <style scoped>
  #stockChart {
    width: 100%;
    height: 400px;
  }
  </style>
  