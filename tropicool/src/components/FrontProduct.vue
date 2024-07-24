<template>
  <div id="header-filter" class="sticky border-y-2 border-slate-200 top-20 bg-white z-50">
    <div class="flex items-center justify-between w-full px-4 py-2">
      <h1 class="text-black font-bold text-xl">
        Nos Produits (<span>{{ filteredProducts.length }}</span>)
      </h1>
      <div class="flex gap-4 items-center">
        <button @click="toggleFilters" class="text-black font-bold flex items-center gap-2">
          <span>{{ filtersVisible ? 'Masquer les filtres' : 'Afficher les filtres' }}</span>
          <component :is="iconFilterSetting"/>
        </button>
        <select v-model="sortOption" @change="updateURL" class="py-2 px-4 rounded-sm border border-slate-200">
          <option value="">Trier par</option>
          <option value="name_asc">Nom croissant</option>
          <option value="name_desc">Nom décroissant</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
        </select>
      </div>
    </div>
  </div>
  <div class="flex relative transition-all">
    <aside class="w-3/12 p-4 sticky transition-all h-full z-50 overflow-y-auto" :class="filtersVisible ? '' : '-ml-3/12'" :style="asideStyle">
      <div class="grid gap-6">
        <div class="grid gap-2">
          <label for="search-product" class="text-lg font-bold">Rechercher</label>
          <div class="flex items-center gap-4">
            <input id="search-product" ref="searchInput" type="search" v-model="searchText" placeholder="Rechercher un produit..." @input="onInput" class="py-2 px-4 rounded-sm border border-slate-200 w-full" />
          </div>
        </div>
        <div v-if="categories.length > 0" class="grid gap-2">
          <label for="category" class="text-lg font-bold">Catégories</label>
          <select id="category" class="py-2 px-4 rounded-sm border border-slate-200" v-model="selectedCategory" @change="updateURL">
            <option value="">Toutes les catégories</option>
            <option v-for="category in categories" :key="category.id" :value="category.name">{{ category.name }}</option>
          </select>
        </div>
        <div class="grid gap-2 text-black">
          <label class="text-lg font-bold">Produits Alcoolisés</label>
          <div class="flex items-center">
            <input type="radio" id="alcohol-all" name="alcohol" value="" v-model="alcoholFilter" @change="updateURL">
            <label for="alcohol-all" class="ml-2">Tout voir</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="alcohol-yes" name="alcohol" value="true" v-model="alcoholFilter" @change="updateURL">
            <label for="alcohol-yes" class="ml-2">Avec alcool</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="alcohol-no" name="alcohol" value="false" v-model="alcoholFilter" @change="updateURL">
            <label for="alcohol-no" class="ml-2">Sans alcool</label>
          </div>
        </div>
        <div class="grid gap-2 text-black">
          <label class="text-lg font-bold">Filtrer par prix</label>
          <div class="flex items-center">
            <input type="radio" id="price-all" name="price" value="" v-model="priceRange" @change="updateURL">
            <label for="price-all" class="ml-2">Tout voir</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="price-0-10" name="price" value="0-10" v-model="priceRange" @change="updateURL">
            <label for="price-0-10" class="ml-2">Moins de 10€</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="price-10-20" name="price" value="10-20" v-model="priceRange" @change="updateURL">
            <label for="price-10-20" class="ml-2">Entre 10 et 20€</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="price-20-30" name="price" value="20-30" v-model="priceRange" @change="updateURL">
            <label for="price-20-30" class="ml-2">Entre 20€ et 30€</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="price-30+" name="price" value="30+" v-model="priceRange" @change="updateURL">
            <label for="price-30+" class="ml-2">Plus de 30€</label>
          </div>
        </div>
        <div class="grid gap-2 text-black">
          <label class="text-lg font-bold">Stock</label>
          <div class="flex items-center">
            <input type="radio" id="stock-all" name="stock" value="" v-model="stockFilter" @change="updateURL">
            <label for="stock-all" class="ml-2">Tout voir</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="stock-available" name="stock" value="available" v-model="stockFilter" @change="updateURL">
            <label for="stock-available" class="ml-2">Disponible</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="stock-unavailable" name="stock" value="unavailable" v-model="stockFilter" @change="updateURL">
            <label for="stock-unavailable" class="ml-2">Indisponible</label>
          </div>
        </div>
      </div>
    </aside>
    <section :class="filtersVisible ? 'w-full transition-all' : 'w-full ml-0 transition-all'">
      <template v-if="filteredProducts.length > 0">
        <ul class="relative w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 grid-flow-row gap-8 flex-wrap p-4 transition-all">
          <ProductCardComponent v-for="product in filteredProducts" :key="product.id" :product="product" />
        </ul>
      </template>
      <template v-else>
        <div class="p-4">
          <h2 class="text-xl text-black font-bold">Aucun produit trouvé</h2>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProductCardComponent from '../components/ProductCardComponent.vue';
import iconFilterSetting from '../assets/icons/filter-setting.svg';
import { useToast } from 'vue-toast-notification';

const $toast = useToast();
const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const selectedCategory = ref<string>('');
const searchText = ref<string>('');
const searchQuery = ref<string>('');
const sortOption = ref<string>('');
const priceRange = ref<string>('');
const alcoholFilter = ref<string>('');
const stockFilter = ref<string | null>('');
const apiUrl = import.meta.env.VITE_API_URL;
const searchInput = ref<HTMLInputElement | null>(null);
const filtersVisible = ref(true);
const asideStyle = ref({ top: '139px', maxHeight: 'fit-content' });

const router = useRouter();
const route = useRoute();

const validatePriceRange = (minPrice: string, maxPrice?: string) => {
  const validMinPrices = ['0', '10', '20', '30'];
  const validMaxPrices = ['10', '20', '30', ''];

  return validMinPrices.includes(minPrice) && (maxPrice === undefined || validMaxPrices.includes(maxPrice));
};

const validateAlcoholFilter = (value: string) => {
  return value === 'true' || value === 'false' || value === undefined;
};

const fetchCategories = async () => {
  try {
    const params = new URLSearchParams({
      frontend: 'true',
      sorting: 'true',
    });

    const response = await fetch(`${apiUrl}/category?${params.toString()}`, {
      method: 'GET',
    });

    if (response.status !== 200) {
      $toast.open({
        message: '157 Erreur, veuillez recommencer',
        type: 'error',
        position: 'bottom-left',
      });
    }

    const data = await response.json();
    
    categories.value = data;

    syncFiltersWithRoute();
  } catch (error) {
    $toast.open({
      message: '169 Erreur, veuillez recommencer',
      type: 'error',
      position: 'bottom-left',
    });
  }
};

const fetchProducts = async () => {
  try {
    const params = new URLSearchParams({
      frontend: 'true',
      sorting: 'true',
      search: searchQuery.value,
      sort: sortOption.value,
      category: selectedCategory.value,
    });

    if (alcoholFilter.value) {
      params.append('with-alcohol', alcoholFilter.value);
    }

    if (priceRange.value) {
      if (priceRange.value === '30+') {
        params.append('min-price', '30');
      } else {
        const [minPrice, maxPrice] = priceRange.value.split('-');
        if (minPrice) params.append('min-price', minPrice);
        if (maxPrice) params.append('max-price', maxPrice);
      }
    }

    if (stockFilter.value) {
      params.append('stock', stockFilter.value);
    }

    const response = await fetch(`${apiUrl}/product?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format');
    }

    products.value = data;
  } catch (error) {
    $toast.open({
      message: '220 Erreur, veuillez recommencer',
      type: 'error',
      position: 'bottom-left',
    });
    products.value = [];
  }
};

const filteredProducts = computed(() => {
  if (!Array.isArray(products.value)) {
    return [];
  }

  return products.value.filter(product => {
    let matchesSearch = true;
    let matchesPrice = true;
    let matchesAlcohol = true;
    let matchesCategory = true;
    let matchesStock = true;

    if (searchQuery.value) {
      matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    }

    if (priceRange.value) {
      const price = product.price;
      if (priceRange.value === '0-10') {
        matchesPrice = price < 10;
      } else if (priceRange.value === '10-20') {
        matchesPrice = price >= 10 && price < 20;
      } else if (priceRange.value === '20-30') {
        matchesPrice = price >= 20 && price < 30;
      } else if (priceRange.value === '30+') {
        matchesPrice = price >= 30;
      }
    }

    if (alcoholFilter.value) {
      matchesAlcohol = alcoholFilter.value === product.is_adult.toString();
    }

    if (selectedCategory.value) {
      matchesCategory = product.categories.some((category: { name: string; }) => category.name === selectedCategory.value);
    }

    if (stockFilter.value) {
      matchesStock = stockFilter.value === 'available' ? product.stock > 0 : product.stock === 0;
    }

    return matchesSearch && matchesPrice && matchesAlcohol && matchesCategory && matchesStock;
  }).sort((a, b) => {
    if (sortOption.value === 'name_asc') {
      return a.name.localeCompare(b.name);
    } else if (sortOption.value === 'name_desc') {
      return b.name.localeCompare(a.name);
    } else if (sortOption.value === 'price_asc') {
      return a.price - b.price;
    } else if (sortOption.value === 'price_desc') {
      return b.price - a.price;
    }
    return 0;
  });
});

const toggleFilters = () => {
  filtersVisible.value = !filtersVisible.value;
};

const updateURL = () => {
  const query: Record<string, string | undefined> = {
    search: searchQuery.value || undefined,
    sort: sortOption.value || undefined,
    category: selectedCategory.value || undefined,
  };

  if (alcoholFilter.value) {
    query['with-alcohol'] = alcoholFilter.value;
  }

  if (stockFilter.value) {
    query['stock'] = stockFilter.value;
  }

  if (priceRange.value) {
    if (priceRange.value === '0-10') {
      query['max-price'] = '10';
    } else if (priceRange.value === '10-20') {
      query['min-price'] = '10';
      query['max-price'] = '20';
    } else if (priceRange.value === '20-30') {
      query['min-price'] = '20';
      query['max-price'] = '30';
    } else if (priceRange.value === '30+') {
      query['min-price'] = '30';
    }
  }

  router.push({ query });
};

const syncFiltersWithRoute = () => {
  searchText.value = route.query.search as string || '';
  searchQuery.value = route.query.search as string || '';
  sortOption.value = route.query.sort as string || '';
  selectedCategory.value = route.query.category as string || '';
  stockFilter.value = route.query.stock as string || null;

  const minPrice = route.query['min-price'];
  const maxPrice = route.query['max-price'];

  if (validatePriceRange(minPrice as string, maxPrice as string)) {
    if (minPrice && maxPrice) {
      priceRange.value = `${minPrice}-${maxPrice}`;
    } else if (minPrice) {
      priceRange.value = `${minPrice}+`;
    } else {
      priceRange.value = '';
    }
  } else {
    priceRange.value = '';
  }

  if (validateAlcoholFilter(route.query['with-alcohol'] as string)) {
    if (route.query['with-alcohol'] === 'true') {
      alcoholFilter.value = 'true';
    } else if (route.query['with-alcohol'] === 'false') {
      alcoholFilter.value = 'false';
    } else {
      alcoholFilter.value = '';
    }
  } else {
    alcoholFilter.value = '';
  }

  if (route.query['stock'] === 'available') {
    stockFilter.value = 'available';
  } else if (route.query['stock'] === 'unavailable') {
    stockFilter.value = 'unavailable';
  } else {
    stockFilter.value = '';
  }
};

const onInput = () => {
  searchQuery.value = searchText.value.trim();
  updateURL();
};

const updateAsideStyle = () => {
  const mainNavbar = document.getElementById('main-navbar');
  const headerFilter = document.getElementById('header-filter');
  const mainFooter = document.getElementById('main-footer');
  const app = document.getElementById('app');

  if (mainNavbar && headerFilter && mainFooter && app) {
    const navbarHeight = mainNavbar.offsetHeight;
    const headerFilterHeight = headerFilter.offsetHeight;
    const footerHeight = mainFooter.offsetHeight;
    const windowHeight = window.innerHeight;
    const appHeight = app.offsetHeight;

    const scrollPosition = window.scrollY;
    const distanceFromBottom = appHeight - (scrollPosition + windowHeight);
    const isScrolledToBottom = distanceFromBottom <= footerHeight;
    
    const commonTop = `${navbarHeight + headerFilterHeight + 2}px`;

    if (isScrolledToBottom) {
      asideStyle.value = {
        top: commonTop,
        maxHeight: `${windowHeight - (navbarHeight + headerFilterHeight + 2 + footerHeight - distanceFromBottom) - 5}px`,
      };
    } else {
      asideStyle.value = {
        top: commonTop,
        maxHeight: `${windowHeight - (navbarHeight + headerFilterHeight + 2) - 5}px`,
      };
    }
  }
};

onMounted(() => {
  fetchCategories();
  fetchProducts();

  nextTick(() => {
    updateAsideStyle();
  });

  window.addEventListener('scroll', updateAsideStyle);
  window.addEventListener('resize', updateAsideStyle);

  const handleProductUpdated = () => fetchProducts();
  const handleProductAdded = () => fetchProducts();
  const handleProductDeleted = () => fetchProducts();

  window.addEventListener('product-added', handleProductAdded);
  window.addEventListener('product-updated', handleProductUpdated);
  window.addEventListener('product-deleted', handleProductDeleted);

  if (route.query.focus === 'search') {
    searchInput.value?.focus();
  }

  onUnmounted(() => {
    window.removeEventListener('scroll', updateAsideStyle);
    window.removeEventListener('resize', updateAsideStyle);
    window.removeEventListener('product-added', handleProductAdded);
    window.removeEventListener('product-updated', handleProductUpdated);
    window.removeEventListener('product-deleted', handleProductDeleted);
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateAsideStyle);
  window.removeEventListener('resize', updateAsideStyle);
});
</script>

<style scoped>
  .-ml-3\/12 {
    margin-left: -25%;
  }
</style>