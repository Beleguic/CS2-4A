<template>
  <li class="bg-white border border-main rounded-sm p-5 w-full transition-all relative">
    <article class="flex flex-col justify-between gap-4 h-full">
      <section class="grid gap-2">
        <figure>
          <img :src="getImageUrl(product.image)" alt="Product Image" class="w-full h-full object-cover" />
        </figure>
        <h3 class="text-2xl text-main font-bold">{{ product.name }}</h3>
        <div class="price-container">
          <p v-if="product.has_active_promotion && product.final_price" class="text-xl text-secondary font-medium">
            <span class="original-price">{{ product.price }} €</span>
            <span class="final-price">{{ product.final_price }} €</span>
          </p>
          <p v-else class="text-xl text-secondary font-medium">{{ product.price }} €</p>
        </div>
        <div v-if="product.has_active_promotion" class="promotion-badge">
          <span>PROMO</span>
        </div>
        <p v-if="product.is_adult" class="text-red-500 text-xs">Contient de l'alcool. À consommer avec modération.</p>
      </section>
      <footer class="button-container">
        <router-link :to="{ name: 'ProductPage', params: { id: product.name } }" class="add-to-cart-button">
          <img src="/Iconfrigo.png" alt="Cart Icon" class="cart-icon" />
          Voir le produit
        </router-link>  
      </footer>
    </article>
  </li>
</template>

<script setup>
import { defineProps } from 'vue';
import { useToast } from 'vue-toast-notification';

const $toast = useToast();

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const getImageUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  let relativePath = path;

  if (!path) {
    $toast.open({
      message: 'Erreur, veuillez recommencer',
      type: 'error',
      position: 'bottom-left',
    });
    return '';
  }

  if (path.startsWith(baseUrl)) {
    relativePath = path.replace(baseUrl, '');
  }

  relativePath = relativePath.replace('/home/node/app', '');

  if (!relativePath.startsWith('/')) {
    relativePath = `/${relativePath}`;
  }

  const imageUrl = `${baseUrl}${relativePath}`;
  return imageUrl;
};
</script>

<style scoped>
.product-card {
  background-color: #ffffff;
  border: 1px solid #696BE2;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.product-image {
  width: 100%;
  height: 200px; /* Ajustez cette valeur selon vos besoins */
  object-fit: contain; /* Cette propriété permet de réduire l'image sans la couper */
  border-radius: 10px;
}

.product-name {
  font-size: 24px;
  font-weight: bold;
  color: #696BE2;
  margin: 15px 0 10px;
}

.product-price {
  font-size: 20px;
  font-weight: 500;
  color: #1D1F96;
  margin-bottom: 20px;
}

.price-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.original-price {
  text-decoration: line-through;
  color: #6b7280;
  font-size: 0.875rem;
}

.final-price {
  color: #ef4444;
  font-weight: 600;
}

.promotion-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.alcohol-warning {
  color: red;
  font-size: 12px;
  margin-bottom: 10px;
}

.button-container {
  margin-top: auto;
}

.add-to-cart-button {
  background-color: #696BE2;
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: auto;
  transition: background-color 0.3s;
}

.add-to-cart-button:hover {
  background-color: #5756A1;
}

.cart-icon {
  width: 30px;
  height: 30px;
}

.error-message {
  color: red;
  font-size: 12px;
  margin-top: 10px;
}
</style>

