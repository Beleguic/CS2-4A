import axios from 'axios';
import { ref } from 'vue';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  reference: string;
}

interface CartProduct {
  product_id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  reference: string;
}

interface Cart {
  id: string;
  user_id: string;
  cartProductsData: CartProduct[];
}

interface Stock {
  id: string;
  product_id: string;
  quantity: number;
  status: string;
  difference: string;
}

interface CartProductCount {
  product_id: string;
  total_count: number;
}

export function useUpdateCartItemQuantity() {
  const selectedItem = ref<string | null>(null);
  const selectedQuantity = ref<number>(1);

  const selectItem = (productId: string, currentQuantity: number) => {
    selectedItem.value = productId;
    selectedQuantity.value = currentQuantity;
  };

  const calculateDifference = (oldQuantity: number, newQuantity: number) => {
    const difference = newQuantity - oldQuantity;
    return difference > 0 ? `+${difference}` : `${difference}`;
  };

  const updateQuantity = async (
    productId: string,
    userId: string | null
  ): Promise<{ message: { error?: string; success?: string } }> => {
    const quantity = selectedQuantity.value;
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!userId) {
      return { message: { error: "You have to be connected" } };
    }

    if (!productId) {
      return { message: { error: "Item is required" } };
    }

    if (isNaN(quantity) || quantity <= 0 || quantity >= 11) {
      return { message: { error: "Quantity must be between 1 and 10" } };
    }

    try {
      const productResponse = await axios.get<Product>(`${apiUrl}/product/${productId}`);
      const product = productResponse.data;
      if (!product) {
        return { message: { error: "Product must be valid" } };
      }

      const stockResponse = await axios.get<Stock[]>(`${apiUrl}/stock`, {
        params: { product_id: productId }
      });
      const stockData = stockResponse.data;
      const latestStock = stockData[stockData.length - 1];

      const cartResponseProduct = await axios.get<CartProductCount[]>(`${apiUrl}/cart/product/count`, {
        params: { product_id: productId }
      });
      const numberProductOnCart = cartResponseProduct.data;
      const cartResponse = await axios.get<Cart[]>(`${apiUrl}/cart`, {
        params: { user_id: userId }
      });
      const cartData = cartResponse.data;
      console.log('cartData', cartData);
      let quantityCartUser = 0;

      if(cartData[0].cartProductsData[0].quantity){
        quantityCartUser = cartData[0].cartProductsData[0].quantity;
      }

      console.log('----');
      console.log(quantityCartUser);
      console.log(numberProductOnCart.total_count);
      console.log((latestStock.quantity - (numberProductOnCart.total_count - quantityCartUser)));
      console.log(quantity);
      console.log('----');
      if (!latestStock || (latestStock.quantity - (numberProductOnCart.total_count - quantityCartUser)) < quantity) {
        return { message: { error: "Stock unavailable" } };
      }



      let activeCart: Cart;
      if (!cartData || cartData.length === 0) {
        return { message: { error: "Please fill your cart" } };
      } else {
        activeCart = cartData[0];
        const existingProductIndex = activeCart.cartProductsData.findIndex(product => product.product_id === productId);

        if (existingProductIndex !== -1) {
          const currentQuantity = activeCart.cartProductsData[existingProductIndex].quantity;
          const newQuantity = quantity;

          if (newQuantity < 1 || newQuantity > 10) {
            return { message: { error: "Total quantity for this item must be between 1 and 10" } };
          }

          if (newQuantity === currentQuantity) {
            return { message: { error: "Selected quantity is the same as current quantity" } };
          }

          activeCart.cartProductsData[existingProductIndex].quantity = newQuantity;

        } else {
          return { message: { error: "Please fill your cart" } };
        }

        await axios.patch<Cart>(`${apiUrl}/cart/${activeCart.id}`, {
          user_id: userId,
          cartProductsData: activeCart.cartProductsData,
        });
      }

      selectedItem.value = null;
      return { message: { success: "Quantity updated successfully" } };
    } catch (error) {
      return { message: { error: "An error has occurred" } };
    }
  };

  return {
    selectedItem,
    selectedQuantity,
    selectItem,
    updateQuantity,
  };
}