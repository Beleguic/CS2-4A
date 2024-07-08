// composables/useAddToCartFromValidation.js
import axios from 'axios';

export async function useAddToCartFormValidation(item, quantity, userId) {
  quantity = parseInt(quantity, 10);

  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!item) {
    throw new Error('Product item is required');
  }

  if (isNaN(quantity) || quantity <= 0 || quantity >= 11) {
    throw new Error('Quantity must be between one and ten');
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    // Vérifier s'il y a un panier actif pour cet utilisateur
    let cartResponse = await axios.get(`${apiUrl}/cart`, {
      params: {
        user_id: userId,
        paid_at: null,
      }
    });

    let activeCart;
    if (cartResponse.data.length === 0) {
      // Créer un nouveau panier si aucun panier actif n'existe
      const newCartResponse = await axios.post(`${apiUrl}/cart/new`, {
        user_id: userId,
        products: [{ product_id: item, quantity }],
      });
      activeCart = newCartResponse.data;
    } else {
      // Ajouter le produit et la quantité au panier existant
      activeCart = cartResponse.data[0]; // Assuming the first cart is the most recent one
      await axios.patch(`${apiUrl}/cart/${activeCart.id}`, {
        products: [...activeCart.cartProductsData, { product_id: item, quantity }],
      });
    }

    return {
      user,
      activeCart,
    };
  } catch (error) {
    console.error('Error during validation:', error);
    throw new Error('Validation failed');
  }
}