
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  reference: string;
  tva: string;
  is_adult: boolean;
}

interface CartProduct {
  product_id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  reference: string;
  tva: string;
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
}

export async function useAddToCartFormValidation(
  item: string,
  quantity: number,
  userId: string | null
): Promise<{ message: { error?: string; success?: string } }> {
  quantity = parseInt(quantity.toString(), 10);

  const apiUrl = import.meta.env.VITE_API_URL;

  if (!userId) {
    return { message: { error: "Veuillez vous connecter" } };
  }

  if (!item) {
    return { message: { error: "Veuillez choisir un produit" } };
  }

  if (isNaN(quantity) || quantity <= 0 || quantity >= 11) {
    return { message: { error: "Quantity must be between 1 and 10" } };
  }

  try {
    const productResponse = await axios.get<Product>(`${apiUrl}/product/${item}`);
    const product = productResponse.data;
    if (!product) {
      return { message: { error: "Product must be valid" } };
    }

    const stockResponse = await axios.get<Stock[]>(`${apiUrl}/stock`, {
      params: { product_id: item }
    });
    const stockData = stockResponse.data;
    const latestStock = stockData[stockData.length - 1];

    if (!latestStock || latestStock.quantity < quantity) {
      return { message: { error: "Stock indisponible" } };
    }

    const cartResponse = await axios.get<Cart[]>(`${apiUrl}/cart`, {
      params: { user_id: userId }
    });
    const cartData = cartResponse.data;

    let activeCart: Cart;
    if (!cartData || cartData.length === 0) {
      const cartProductsData: CartProduct[] = [{ product_id: item, name: product.name, quantity: quantity, price: product.price, image: product.image, reference: product.reference, tva: product.tva, is_adult: product.is_adult }];
      const newCartResponse = await axios.post<Cart>(`${apiUrl}/cart/new`, {
        user_id: userId,
        cartProductsData: cartProductsData,
      });
      activeCart = newCartResponse.data;

      await axios.post(`${apiUrl}/stock/new`, {
        product_id: item,
        quantity: latestStock.quantity - quantity,
        status: 'remove'
      });

      return { message: { success: "Produit ajouté au panier" } };
    } else {
      activeCart = cartData[0];
      const existingProductIndex = activeCart.cartProductsData.findIndex(product => product.product_id === item);

      if (existingProductIndex !== -1) {
        const newQuantity = activeCart.cartProductsData[existingProductIndex].quantity + quantity;
        if (newQuantity < 1 || newQuantity > 10) {
          return { message: { error: "La quantité ne doit pas excéder 10 !" } };
        }
        activeCart.cartProductsData[existingProductIndex].quantity = newQuantity;
      } else {
        if (quantity < 1 || quantity > 10) {
          return { message: { error: "La quantité ne doit pas excéder 10 !" } };
        }
        activeCart.cartProductsData.push({ product_id: item, name: product.name, quantity: quantity, price: product.price, image: product.image, reference: product.reference, tva: product.tva, is_adult: product.is_adult });
      }

      await axios.patch<Cart>(`${apiUrl}/cart/${activeCart.id}`, {
        user_id: userId,
        cartProductsData: activeCart.cartProductsData,
      });
    }

    await axios.post(`${apiUrl}/stock/new`, {
      product_id: item,
      quantity: latestStock.quantity - quantity,
      status: 'remove'
    });

    return { message: { success: "Produit ajouté au panier" } };
  } catch (error) {
    return { message: { error: "Un problème est survenu, veuillez recommencer !" } };
  }
}