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
    // Récupérer les détails du produit y compris le prix
    const productResponse = await axios.get(`${apiUrl}/product/${item}`);
    const product = productResponse.data;

    // Vérifier s'il y a un panier actif pour cet utilisateur
    let cartResponse = await axios.get(`${apiUrl}/cart`, {
      params: {
        user_id: userId,
        paid_at: null,
      }
    });

    let activeCart;
    if (cartResponse.data.length === 0) {
      const cartProductsData = [{ product_id: item, name: product.name, quantity: quantity, price: product.price }];
      console.log('Creating new cart with:', cartProductsData);  // Debugging
      const newCartResponse = await axios.post(`${apiUrl}/cart/new`, {
        user_id: userId,
        cartProductsData: cartProductsData,
      });
      activeCart = newCartResponse.data;
    } else {
      activeCart = cartResponse.data[0];
      const updatedCartProductsData = [...activeCart.cartProductsData, { product_id: item, name: product.name, quantity: quantity, price: product.price }];
      console.log('Updating existing cart with:', updatedCartProductsData);  // Debugging
      await axios.patch(`${apiUrl}/cart/${activeCart.id}`, {
        cartProductsData: updatedCartProductsData,
      });
    }

    return {
      userId,
      activeCart,
    };
  } catch (error) {
    console.error('Error during validation:', error);
    throw new Error('Validation failed');
  }
}