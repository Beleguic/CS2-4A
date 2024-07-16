import { onBeforeMount } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

interface CartProductData {
  product_id: string;
  quantity: number;
}

interface CartResponse {
  id: string;
  updated_at: string;
  expired_at: string;
  cartProductsData: CartProductData[];
}

export default function useCartCheck() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const router = useRouter();

  const calculateDifference = (oldQuantity: number, newQuantity: number) => {
    const difference = newQuantity - oldQuantity;
    return difference > 0 ? `${difference}` : `${difference}`;
  };

  const checkCart = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const response = await axios.get<CartResponse[]>(`${apiUrl}/cart?user_id=${userId}`);
      const cart = response.data[0];

      if (!cart) return;

      const { id, expired_at, cartProductsData } = cart;
      const now = new Date();

      const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
      const expiredAtUtc = Date.parse(expired_at);

      if (nowUtc > expiredAtUtc) {
        alert("Panier expiré, veuillez recommencer");

        for (const product of cartProductsData) {
          try {
            const stockResponse = await axios.get<{ quantity: number }>(`${apiUrl}/stock?product_id=${product.product_id}`);
            const currentStock = stockResponse.data.quantity;
            const newQuantity = currentStock + product.quantity;
            const difference = calculateDifference(currentStock, newQuantity);

            await axios.post(`${apiUrl}/stock/new`, {
              product_id: product.product_id,
              quantity: newQuantity,
              status: 'add',
              difference: difference
            });
          } catch (stockError) {
            console.error(`Erreur lors de la mise à jour du stock pour le produit ${product.product_id}`, stockError);
          }
        }

        await axios.delete(`${apiUrl}/cart/${id}`);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du panier', error);
    }
  };

  onBeforeMount(checkCart);

  router.beforeEach((to, from, next) => {
    checkCart().then(() => next());
  });
}