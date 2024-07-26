import { ref } from 'vue';
import { useToast } from 'vue-toast-notification';

const $toast = useToast();

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  reference: string;
  tva: number;
  is_adult: boolean;
}

interface CartProduct {
  product_id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  reference: string;
  tva: number;
  is_adult: boolean;
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

  (oldQuantity: number, newQuantity: number) => {
    const difference = newQuantity - oldQuantity;
    return difference > 0 ? `+${difference}` : `${difference}`;
  };
  
  const updateQuantity = async (
    productId: string,
    userId: string | null
  ): Promise<{ message: { error?: string; success?: string } }> => {
    const quantity = selectedQuantity.value;
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    if (!userId) {
      $toast.open({
        message: 'Vous devez être connectée pour ajouter ce produit au panier',
        type: 'warning',
        position: 'bottom-left',
        duration: 5000,
      });
      return { message: { error: 'Vous devez être connectée pour ajouter ce produit au panier' } };
    }

    if (!productId) {
      $toast.open({
        message: 'Veuillez rajouter un produit valide!',
        type: 'warning',
        position: 'bottom-left',
        duration: 5000,
      });
      return { message: { error: 'Veuillez rajouter un produit valide!' } };
    }

    if (isNaN(quantity) || quantity <= 0 || quantity >= 11) {
      $toast.open({
        message: 'La quantité ne peut pas exécéder 10!',
        type: 'warning',
        position: 'bottom-left',
        duration: 5000,
      });
      return { message: { error: 'La quantité ne peut pas exécéder 10!' } };
    }

    try {
      const productResponse = await fetch(`${apiUrl}/product/${productId}`, {
        method : "GET", 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }, 
      });

      if (productResponse.status !== 200) {
        $toast.open({
          message: 'Erreur! Veuillez recommencer!',
          type: 'error',
          position: 'bottom-left',
        });
        return { message: { error: 'Erreur! Veuillez recommencer!' } };
      }
      await productResponse.json();

      const stockResponse = await fetch(`${apiUrl}/stock?product_id=${productId}`, {
        method : "GET", 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }, 
      });

      if (stockResponse.status !== 200) {
        $toast.open({
          message: 'Erreur! Veuillez recommencer!',
          type: 'error',
          position: 'bottom-left',
        });
        return { message: { error: 'Erreur! Veuillez recommencer!' } };
      }
      const stockData: Stock[] = await stockResponse.json();
      const latestStock = stockData[stockData.length - 1];

      const cartResponseProduct = await fetch(`${apiUrl}/carts/product/count?product_id=${productId}`, {
        method : "GET", 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }, 
      });

      if (cartResponseProduct.status !== 200) {
        $toast.open({
          message: 'Erreur! Veuillez recommencer!',
          type: 'error',
          position: 'bottom-left',
        });
        return { message: { error: 'Erreur! Veuillez recommencer!' } };
      }
      const numberProductOnCart: CartProductCount[] = await cartResponseProduct.json();

      const cartResponse = await fetch(`${apiUrl}/carts?user_id=${userId}`, {
        method : "GET", 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }, 
      });
      if (cartResponse.status !== 200) {
        $toast.open({
          message: 'Erreur! Veuillez recommencer!',
          type: 'error',
          position: 'bottom-left',
        });
        return { message: { error: 'Erreur! Veuillez recommencer!' } };
      }
      const cartData: Cart[] = await cartResponse.json();

      let quantityCartUser = 0;
      if (cartData[0].cartProductsData[0].quantity) {
        quantityCartUser = cartData[0].cartProductsData[0].quantity;
      }

      const totalProductCount = numberProductOnCart.length ? numberProductOnCart[0].total_count : 0;
      if (!latestStock || (latestStock.quantity - (totalProductCount - quantityCartUser)) < quantity) {
        $toast.open({
          message: 'Stock indisponible !',
          type: 'warning',
          position: 'bottom-left',
          duration: 5000,
        });
      }

      let activeCart: Cart;
      if (!cartData || cartData.length === 0) {
        $toast.open({
          message: 'Erreur! Veuillez recommencer!',
          type: 'error',
          position: 'bottom-left',
        });
      } else {
        activeCart = cartData[0];
        const existingProductIndex = activeCart.cartProductsData.findIndex(product => product.product_id === productId);

        if (existingProductIndex !== -1) {
          const currentQuantity = activeCart.cartProductsData[existingProductIndex].quantity;
          const newQuantity = quantity;

          if (newQuantity < 1 || newQuantity > 10) {
            $toast.open({
              message: 'La quantité ne peut pas exécéder 10!',
              type: 'warning',
              position: 'bottom-left',
              duration: 5000,
            });
          }

          if (newQuantity === currentQuantity) {
            $toast.open({
              message: 'Veuillez choisir une quantité différente que celle dans votre panier!',
              type: 'warning',
              position: 'bottom-left',
              duration: 5000,
            });
          }

          activeCart.cartProductsData[existingProductIndex].quantity = newQuantity;

        } else {
          $toast.open({
            message: 'Erreur! Veuillez recommencer!',
            type: 'error',
            position: 'bottom-left',
          });
        }

        const updateCartResponse = await fetch(`${apiUrl}/carts/${activeCart.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: userId,
            cartProductsData: activeCart.cartProductsData,
          }),
        });

        if (updateCartResponse.status !== 200) {
          $toast.open({
            message: 'Erreur! Veuillez recommencer!',
            type: 'error',
            position: 'bottom-left',
          });
          return { message: { error: 'Erreur! Veuillez recommencer!' } };
        }
      }

      selectedItem.value = null;

      $toast.open({
        message: 'Panier mise-à-jour ajouté au panier!',
        type: 'success',
        position: 'bottom-left',
      });
      return { message: { success: 'Panier mise-à-jour ajouté au panier!' } };
    } catch (error) {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      });
      return { message: { error: 'Erreur! Veuillez recommencer!' } };
    }
  };

  return {
    selectedItem,
    selectedQuantity,
    selectItem,
    updateQuantity,
  };
}