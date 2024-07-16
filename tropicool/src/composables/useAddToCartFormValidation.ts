import axios from 'axios';

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

export async function useAddToCartFormValidation(
  item: string,
  quantity: number,
  userId: string | null
): Promise<{ message: { error?: string; success?: string } }> {
  quantity = parseInt(quantity.toString(), 10);

  const apiUrl = import.meta.env.VITE_API_URL;

  if (!userId) {
    console.error("User is not logged in");
    return { message: { error: "Veuillez vous connecter" } };
  }

  if (!item) {
    console.error("Item is not provided");
    return { message: { error: "Item is required" } };
  }

  if (isNaN(quantity) || quantity <= 0 || quantity >= 11) {
    console.error("Invalid quantity", quantity);
    return { message: { error: "La quantité ne doit pas excéder 10 !" } };
  }

  const calculateDifference = (oldQuantity: number, newQuantity: number): string => {
    const difference = newQuantity - oldQuantity;
    return difference > 0 ? `+${difference}` : `${difference}`;
  };

  try {
    const productResponse = await axios.get<Product>(`${apiUrl}/product/${item}`);
    const product = productResponse.data;
    if (!product) {
      console.error("Invalid product", item);
      return { message: { error: "Veuillez choisir un produit valide" } };
    }

    const stockResponse = await axios.get<Stock[]>(`${apiUrl}/stock`, {
      params: { product_id: item }
    });
    const stockData = stockResponse.data;
    const latestStock = stockData[stockData.length - 1];

    if (!latestStock || latestStock.quantity < quantity) {
      console.error("Insufficient stock", latestStock);
      return { message: { error: "Stock indisponible" } };
    }

    const cartResponse = await axios.get<Cart[]>(`${apiUrl}/cart`, {
      params: { user_id: userId }
    });
    const cartData = cartResponse.data;

    let activeCart: Cart;
    if (!cartData || cartData.length === 0) {
      const cartProductsData: CartProduct[] = [{
        product_id: item,
        name: product.name,
        quantity: quantity,
        price: product.price,
        image: product.image,
        reference: product.reference,
        tva: product.tva,
        is_adult: product.is_adult
      }];

      axios.post(`${apiUrl}/cart/new`, {
        user_id: userId,
        cartProductsData: cartProductsData,
      });

      const newQuantity = latestStock.quantity - quantity;
      const difference = calculateDifference(latestStock.quantity, newQuantity);

      axios.post(`${apiUrl}/stock/new`, {
        product_id: item,
        quantity: newQuantity,
        status: 'remove',
        difference: difference,
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
        activeCart.cartProductsData.push({
          product_id: item,
          name: product.name,
          quantity: quantity,
          price: product.price,
          image: product.image,
          reference: product.reference,
          tva: product.tva,
          is_adult: product.is_adult
        });
      }

      await axios.patch<Cart>(`${apiUrl}/cart/${activeCart.id}`, {
        user_id: userId,
        cartProductsData: activeCart.cartProductsData,
      });
    }

    const newStockQuantity = latestStock.quantity - quantity;
    const stockDifference = calculateDifference(latestStock.quantity, newStockQuantity);

    const updatedStock = await axios.post<Stock>(`${apiUrl}/stock/new`, {
      product_id: item,
      quantity: newStockQuantity,
      status: 'remove',
      difference: stockDifference,
    }).then(response => response.data);

    if (!updatedStock || !updatedStock.id) {
      throw new Error("Stock update failed");
    }

    return { message: { success: "Produit ajouté au panier !" } };
  } catch (error) {
    console.error("An error has occurred", error);
    return { message: { error: "An error has occurred" } };
  }
}