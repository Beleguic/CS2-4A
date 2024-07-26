import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';

const $toast = useToast();

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
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const calculateDifference = (oldQuantity: number, newQuantity: number) => {
    return (newQuantity - oldQuantity).toString();
  };

  const fetchCartData = async () => {
    const response = await fetch(`${apiUrl}/carts?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart data');
    }

    return response.json() as Promise<CartResponse[]>;
  };

  const fetchStockData = async (productId: string) => {
    const response = await fetch(`${apiUrl}/stock?product_id=${productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    return response.json();
  };

  const updateStock = async (productId: string, newQuantity: number, difference: string) => {
    await fetch(`${apiUrl}/stock/new`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: newQuantity,
        status: 'add',
        difference: difference,
      }),
    });
  };

  const deleteCart = async (cartId: string) => {
    await fetch(`${apiUrl}/carts/${cartId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  const checkCart = async () => {
    if (!userId) return;

    try {
      const cartData = await fetchCartData();
      const cart = cartData[0];

      if (!cart) return;

      const { id, expired_at, cartProductsData } = cart;
      const now = new Date().getTime();
      const expiredAtUtc = Date.parse(expired_at);

      if (now > expiredAtUtc) {
        $toast.open({
          message: 'Panier expiré, veuillez recommencer',
          type: 'warning',
          position: 'top',
          duration: 5000,
        });

        for (const product of cartProductsData) {
          try {
            const stockData = await fetchStockData(product.product_id);
            const currentStock = stockData.quantity;
            const newQuantity = currentStock + product.quantity;
            const difference = calculateDifference(currentStock, newQuantity);

            await updateStock(product.product_id, newQuantity, difference);
          } catch (stockError) {
            $toast.open({
              message: 'Erreur! Veuillez recommencer!',
              type: 'error',
              position: 'bottom-left',
            });
          }
        }

        await deleteCart(id);
      }
    } catch (error) {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      });
    }
  };

  onBeforeMount(checkCart);

  router.beforeEach((_, __, next) => {
    checkCart().then(() => next());
  });
}