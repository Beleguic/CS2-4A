<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajout d'un produit à une catégorie</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Édition du produit de la catégorie</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Suppression du produit de la catégorie</h1>

      <FormComponent
        :fields="fields"
        v-model:formData="categoryProduct"
        submitButtonText="Envoyer"
        @submit="submitForm"
      />

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer ce produit de la catégorie ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteCategoryProduct" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormComponent from '../components/FormComponent.vue';
import axios from 'axios';

interface CategoryProduct {
  id?: string;
  category_id: string;
  product_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

const route = useRoute();
const router = useRouter();
const categoryProduct = ref<CategoryProduct>({
  category_id: '',
  product_id: '',
});
const categories = ref<Category[]>([]);
const products = ref<Product[]>([]);
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(
  route.name && typeof route.name === 'string' && route.name.includes('New') ? 'new' :
  route.name && typeof route.name === 'string' && route.name.includes('Edit') ? 'edit' : 'delete'
);
const fields = ref<any[]>([]);

const generateFields = () => [
  {
    header: "Formulaire",
    field: [
      [{type: "select", name: "category_id", label: "Catégorie", required: true, options: categories.value, color: "#000000"}],
      [{type: "select", name: "product_id", label: "Produit", required: true, options: products.value, color: "#000000"}]
    ]
  }
];

const fetchProducts = async () => {
  try {
    const response = await fetch(`${apiUrl}/product/list`);
    if (response.ok) {
      const data = await response.json();
      products.value = data.map((product: Product) => ({ value: product.id, label: product.name }));
    } else {
      console.error('Error fetching products');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const fetchCategories = async () => {
  try {
    const response = await fetch(`${apiUrl}/category/list`);
    if (response.ok) {
      const data = await response.json();
      categories.value = data.map((category: Category) => ({ value: category.id, label: category.name }));
    } else {
      console.error('Error fetching categories');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

onMounted(async () => {
  await fetchProducts();
  await fetchCategories();

  fields.value = generateFields();

  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await axios.get<CategoryProduct>(`${apiUrl}/category_product/${route.params.id}`);
      categoryProduct.value = response.data;
    } catch (error) {
      console.error('Error fetching category product:', error);
    }
  }
});

const submitForm = async (formData: CategoryProduct) => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/category_product/new` : `${apiUrl}/category_product/${route.params.id}`;

    const { id, ...payload } = formData;

    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    if (response.status === 200 || response.status === 201) {
      window.dispatchEvent(new CustomEvent(`category-product-${mode.value === 'new' ? 'added' : 'updated'}`));
      setTimeout(() => {
        router.push({ name: 'DBCategoryProductIndex' });
      }, 100);
    } else {
      throw new Error('Error saving category product');
    }
  } catch (error) {
    console.error('Error saving category product:', error);
  }
};

const deleteCategoryProduct = async () => {
  try {
    const response = await axios.delete(`${apiUrl}/category_product/${route.params.id}`);
    if (response.status === 204) {
      window.dispatchEvent(new CustomEvent('category-product-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBCategoryProductIndex' });
      }, 100);
    } else {
      console.error('Failed to delete category product');
    }
  } catch (error) {
    console.error('Error deleting category product:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBCategoryProductIndex' });
};
</script>
