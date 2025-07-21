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
        <button @click="shareCurrentFilters" class="text-black font-bold flex items-center gap-2 px-3 py-2 rounded-sm border border-slate-200 hover:bg-slate-50">
          <span>Partager</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
          </svg>
        </button>
        <select v-model="sortOption" @change="updateURL" class="py-2 px-4 rounded-sm border border-slate-200">
          <option value="">Trier par</option>
          <option value="name_asc">Nom croissant</option>
          <option value="name_desc">Nom décroissant</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="discount_desc">Plus de réduction</option>
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
        <div v-if="brands.length > 0" class="grid gap-2">
          <label for="brand" class="text-lg font-bold">Marques</label>
          <select id="brand" class="py-2 px-4 rounded-sm border border-slate-200" v-model="selectedBrand" @change="updateURL">
            <option value="">Toutes les marques</option>
            <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
          </select>
        </div>
        <div class="grid gap-2">
          <label class="text-lg font-bold">Promotions</label>
          <div class="flex items-center">
            <input type="checkbox" id="promotion-only" v-model="promotionFilter" @change="updateURL">
            <label for="promotion-only" class="ml-2">Produits en promotion uniquement</label>
          </div>
        </div>
        <div class="grid gap-2">
          <label class="text-lg font-bold">Produits Alcoolisés</label>
          <div class="flex items-center">
            <input type="checkbox" id="alcohol-yes" v-model="alcoholFilter" :value="true" @change="updateAlcoholFilter">
            <label for="alcohol-yes" class="ml-2">Avec alcool</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="alcohol-no" v-model="alcoholFilter" :value="false" @change="updateAlcoholFilter">
            <label for="alcohol-no" class="ml-2">Sans alcool</label>
          </div>
        </div>
        <div class="grid gap-2">
          <label class="text-lg font-bold">Filtrer par prix</label>
          <div class="flex items-center">
            <input type="checkbox" id="price-0-10" v-model="priceRange" true-value="0-10" false-value="" @change="updateURL">
            <label for="price-0-10" class="ml-2">Moins de 10€</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="price-10-20" v-model="priceRange" true-value="10-20" false-value="" @change="updateURL">
            <label for="price-10-20" class="ml-2">Entre 10 et 20€</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="price-20-30" v-model="priceRange" true-value="20-30" false-value="" @change="updateURL">
            <label for="price-20-30" class="ml-2">Entre 20€ et 30€</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="price-30+" v-model="priceRange" true-value="30+" false-value="" @change="updateURL">
            <label for="price-30+" class="ml-2">Plus de 30€</label>
          </div>
        </div>
        <div class="grid gap-2">
          <label class="text-lg font-bold">Stock</label>
          <div class="flex items-center">
            <input type="checkbox" id="stock-available" :checked="stockFilter === 'available'" @change="updateStockFilter('available')">
            <label for="stock-available" class="ml-2">Disponible</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="stock-unavailable" :checked="stockFilter === 'unavailable'" @change="updateStockFilter('unavailable')">
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
const brands = ref<string[]>([]);
const selectedCategory = ref<string>('');
const selectedBrand = ref<string>('');
const searchText = ref<string>('');
const searchQuery = ref<string>('');
const sortOption = ref<string>('');
const priceRange = ref<string>('');
const alcoholFilter = ref<boolean[]>([]);
const stockFilter = ref<string | null>(null);
const promotionFilter = ref<boolean>(false);
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

const validateBrandFilter = (value: string) => {
  return typeof value === 'string' && value.trim().length > 0;
};

const validatePromotionFilter = (value: string) => {
  return value === 'true' || value === 'false' || value === undefined;
};

const validateSortOption = (value: string) => {
  const validSortOptions = ['name_asc', 'name_desc', 'price_asc', 'price_desc', 'discount_desc'];
  return validSortOptions.includes(value) || value === undefined;
};

const cleanURLParams = (params: Record<string, any>) => {
  const cleaned: Record<string, string> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = String(value).trim();
    }
  });
  
  return cleaned;
};

const generateShareableURL = () => {
  const currentQuery = { ...route.query };
  const cleanQuery = cleanURLParams(currentQuery);
  
  if (Object.keys(cleanQuery).length === 0) {
    return window.location.origin + route.path;
  }
  
  const queryString = new URLSearchParams(cleanQuery).toString();
  return `${window.location.origin}${route.path}?${queryString}`;
};

const shareCurrentFilters = async () => {
  try {
    const shareableURL = generateShareableURL();
    
    if (navigator.share) {
      // Utiliser l'API Web Share si disponible
      await navigator.share({
        title: 'Filtres Tropicool',
        text: 'Découvrez ces produits filtrés sur Tropicool',
        url: shareableURL
      });
    } else {
      // Fallback : copier dans le presse-papiers
      await navigator.clipboard.writeText(shareableURL);
      $toast.open({
        message: 'Lien copié dans le presse-papiers !',
        type: 'success',
        position: 'bottom-left',
      });
    }
  } catch (error) {
    console.error('Erreur lors du partage:', error);
    $toast.open({
      message: 'Erreur lors du partage',
      type: 'error',
      position: 'bottom-left',
    });
  }
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

    if (!response.ok) {
      $toast.open({
        message: 'Erreur, veuillez recommencer',
        type: 'error',
        position: 'bottom-left',
      });
    }

    const data = await response.json();
    categories.value = data;

    // Extraire les marques uniques des produits
    extractBrands();
    
    syncFiltersWithRoute();
  } catch (error) {
    $toast.open({
      message: 'Erreur, veuillez recommencer',
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
      brand: selectedBrand.value,
      has_promotion: promotionFilter.value.toString(),
    });

    if (alcoholFilter.value.includes(true)) {
      params.append('with-alcohol', 'true');
    } else if (alcoholFilter.value.includes(false)) {
      params.append('with-alcohol', 'false');
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
        $toast.open({
        message: 'Erreur, veuillez recommencer',
        type: 'error',
        position: 'bottom-left',
      });
    }

    const data = await response.json();
    products.value = Array.isArray(data) ? data : [];
    
    // Extraire les marques uniques des produits
    extractBrands();
  } catch (error) {
    $toast.open({
      message: 'Erreur, veuillez recommencer',
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
    let matchesBrand = true;
    let matchesPromotion = true;
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

    if (alcoholFilter.value.length) {
      if (alcoholFilter.value.includes(true) && alcoholFilter.value.includes(false)) {
        matchesAlcohol = true;
      } else {
        matchesAlcohol = alcoholFilter.value.includes(product.is_adult);
      }
    }

    if (selectedCategory.value) {
      matchesCategory = product.categories.some((category: { name: string; }) => category.name === selectedCategory.value);
    }

    if (selectedBrand.value) {
      matchesBrand = product.brand === selectedBrand.value;
    }

    if (promotionFilter.value) {
      matchesPromotion = product.has_active_promotion === true;
    }

    if (stockFilter.value) {
      matchesStock = stockFilter.value === 'available' ? product.stock > 0 : product.stock === 0;
    }

    return matchesSearch && matchesPrice && matchesAlcohol && matchesCategory && matchesBrand && matchesPromotion && matchesStock;
  }).sort((a, b) => {
    if (sortOption.value === 'name_asc') {
      return a.name.localeCompare(b.name);
    } else if (sortOption.value === 'name_desc') {
      return b.name.localeCompare(a.name);
    } else if (sortOption.value === 'price_asc') {
      return a.price - b.price;
    } else if (sortOption.value === 'price_desc') {
      return b.price - a.price;
    } else if (sortOption.value === 'discount_desc') {
      // Trier par pourcentage de réduction décroissant
      const getDiscountPercentage = (product) => {
        if (product.has_active_promotion && product.final_price && product.price > 0) {
          return ((product.price - product.final_price) / product.price) * 100;
        }
        return 0;
      };
      return getDiscountPercentage(b) - getDiscountPercentage(a);
    }
    return 0;
  });
});

const toggleFilters = () => {
  filtersVisible.value = !filtersVisible.value;
};

const updateAlcoholFilter = () => {
  if (!alcoholFilter.value.includes(true) && !alcoholFilter.value.includes(false)) {
    alcoholFilter.value = [];
  } else if (alcoholFilter.value.includes(true) && alcoholFilter.value.includes(false)) {
    alcoholFilter.value = [];
  }
  updateURL();
};

const updateStockFilter = (value: string) => {
  if (stockFilter.value === value) {
    stockFilter.value = null;
  } else {
    stockFilter.value = value;
  }
  updateURL();
};

const updateURL = () => {
  const query: Record<string, string | undefined> = {};

  // Paramètres de base
  if (searchQuery.value && searchQuery.value.trim()) {
    query.search = searchQuery.value.trim();
  }

  if (sortOption.value && validateSortOption(sortOption.value)) {
    query.sort = sortOption.value;
  }

  if (selectedCategory.value && selectedCategory.value.trim()) {
    query.category = selectedCategory.value.trim();
  }

  // Filtre marque
  if (selectedBrand.value && validateBrandFilter(selectedBrand.value)) {
    query.brand = selectedBrand.value.trim();
  }

  // Filtre promotion
  if (promotionFilter.value) {
    query.has_promotion = 'true';
  }

  // Filtre alcool
  if (alcoholFilter.value.includes(true)) {
    query['with-alcohol'] = 'true';
  } else if (alcoholFilter.value.includes(false)) {
    query['with-alcohol'] = 'false';
  }

  // Filtre stock
  if (stockFilter.value && ['available', 'unavailable'].includes(stockFilter.value)) {
    query.stock = stockFilter.value;
  }

  // Filtre prix
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

  // Nettoyer les paramètres undefined
  const cleanQuery = Object.fromEntries(
    Object.entries(query).filter(([_, value]) => value !== undefined)
  );

  router.push({ query: cleanQuery });
};

const extractBrands = () => {
  const uniqueBrands = new Set<string>();
  
  products.value.forEach(product => {
    if (product.brand && product.brand.trim()) {
      uniqueBrands.add(product.brand.trim());
    }
  });
  
  brands.value = Array.from(uniqueBrands).sort();
};

const syncFiltersWithRoute = () => {
  try {
    // Recherche
    const searchParam = route.query.search as string;
    if (searchParam && searchParam.trim()) {
      searchText.value = searchParam.trim();
      searchQuery.value = searchParam.trim();
    } else {
      searchText.value = '';
      searchQuery.value = '';
    }

  // Tri
  const sortParam = route.query.sort as string;
  if (sortParam && validateSortOption(sortParam)) {
    sortOption.value = sortParam;
  } else {
    sortOption.value = '';
  }

  // Catégorie
  const categoryParam = route.query.category as string;
  if (categoryParam && categoryParam.trim()) {
    selectedCategory.value = categoryParam.trim();
  } else {
    selectedCategory.value = '';
  }

  // Marque
  const brandParam = route.query.brand as string;
  if (brandParam && validateBrandFilter(brandParam)) {
    selectedBrand.value = brandParam.trim();
  } else {
    selectedBrand.value = '';
  }

  // Promotion
  const promotionParam = route.query.has_promotion as string;
  if (promotionParam && validatePromotionFilter(promotionParam)) {
    promotionFilter.value = promotionParam === 'true';
  } else {
    promotionFilter.value = false;
  }

  // Prix
  const minPrice = route.query['min-price'] as string;
  const maxPrice = route.query['max-price'] as string;

  if (validatePriceRange(minPrice, maxPrice)) {
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

  // Alcool
  const alcoholParam = route.query['with-alcohol'] as string;
  if (validateAlcoholFilter(alcoholParam)) {
    if (alcoholParam === 'true') {
      alcoholFilter.value = [true];
    } else if (alcoholParam === 'false') {
      alcoholFilter.value = [false];
    } else {
      alcoholFilter.value = [];
    }
  } else {
    alcoholFilter.value = [];
  }

  // Stock
  const stockParam = route.query.stock as string;
  if (stockParam && ['available', 'unavailable'].includes(stockParam)) {
    stockFilter.value = stockParam;
  } else {
    stockFilter.value = null;
  }
  } catch (error) {
    console.error('Erreur lors de la synchronisation des filtres avec l\'URL:', error);
    // Réinitialiser tous les filtres en cas d'erreur
    searchText.value = '';
    searchQuery.value = '';
    sortOption.value = '';
    selectedCategory.value = '';
    selectedBrand.value = '';
    promotionFilter.value = false;
    priceRange.value = '';
    alcoholFilter.value = [];
    stockFilter.value = null;
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
