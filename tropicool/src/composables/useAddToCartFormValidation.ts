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

export async function useAddToCartFormValidation(item: string, quantity: number, userId: string | null): Promise<void> {
  quantity = parseInt(quantity.toString(), 10);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  if (!userId) {
    $toast.open({
      message: 'Vous devez être connectée pour ajouter ce produit au panier',
      type: 'warning',
      position: 'bottom-left',
      duration: 5000,
    });
    return;
  }

  if (!item) {
    $toast.open({
      message: 'Veuillez rajouter un produit valide!',
      type: 'warning',
      position: 'bottom-left',
      duration: 5000,
    });
    return;
  }

  if (isNaN(quantity) || quantity <= 0 || quantity >= 11) {
    $toast.open({
      message: 'La quantité ne peut pas exécéder 10!',
      type: 'warning',
      position: 'bottom-left',
      duration: 5000,
    });
    return;
  }

  try {
    const productResponse = await fetch(`${apiUrl}/product/${item}`, {
      method: "GET",
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
    }

    const product: Product = await productResponse.json();

    const stockResponse = await fetch(`${apiUrl}/stock?product_id=${item}`, {
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
    }

    const stockData: Stock[] = await stockResponse.json();
    const latestStock = stockData[stockData.length - 1];

    const cartResponseProduct = await fetch(`${apiUrl}/carts/product/count?product_id=${item}`, {
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
    }

    const numberProductOnCart: CartProductCount[] = await cartResponseProduct.json();
    const totalProductCount = numberProductOnCart.length ? numberProductOnCart[0].total_count : 0;

    if (!latestStock || (latestStock.quantity - totalProductCount) < quantity) {
      $toast.open({
        message: 'Stock indisponible !',
        type: 'warning',
        position: 'bottom-left',
        duration: 5000,
      });
      return;
    }

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
    }
    const cartData: Cart[] = await cartResponse.json();

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
        is_adult: product.is_adult,
      }];
      
      const newCartResponse = await fetch(`${apiUrl}/carts/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          cartProductsData: cartProductsData,
        }),
      });

      if(newCartResponse.status !== 201) {
        $toast.open({
          message: 'Erreur! Veuillez recommencer!',
          type: 'error',
          position: 'bottom-left',
        });
      }

      $toast.open({
        message: 'Produit ajouté au panier! Vous avez 15 min pour valider le panier',
        type: 'success',
        position: 'bottom-left',
      });
    } else {
      activeCart = cartData[0];
      const existingProductIndex = activeCart.cartProductsData.findIndex(product => product.product_id === item);

      if (existingProductIndex !== -1) {
        const newQuantity = activeCart.cartProductsData[existingProductIndex].quantity + quantity;
        if (newQuantity < 1 || newQuantity > 10) {
          $toast.open({
            message: 'La quantité ne peut pas exécéder 10!',
            type: 'warning',
            position: 'bottom-left',
            duration: 5000,
          });
          return;
        }
        activeCart.cartProductsData[existingProductIndex].quantity = newQuantity;
      } else {
        if (quantity < 1 || quantity > 10) {
          $toast.open({
            message: 'La quantité ne peut pas exécéder 10!',
            type: 'warning',
            position: 'bottom-left',
          });
          return;
        }
        activeCart.cartProductsData.push({
          product_id: item,
          name: product.name,
          quantity: quantity,
          price: product.price,
          image: product.image,
          reference: product.reference,
          tva: product.tva,
          is_adult: product.is_adult,
        });
      }

      const responseUpdate = await fetch(`${apiUrl}/carts/${activeCart.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          cartProductsData: activeCart.cartProductsData,
        }),
      });

      if (responseUpdate.status !== 200) {
        $toast.open({
          message: 'Erreur! Veuillez recommencer!',
          type: 'error',
          position: 'bottom-left',
        });
        return;
      }
      
      $toast.open({
        message: 'Produit ajouté avec succès!',
        type: 'success',
        position: 'bottom-left',
      });
    }
  } catch (error) {
    $toast.open({
      message: 'Erreur! Veuillez recommencer!',
      type: 'error',
      position: 'bottom-left',
    });
  }
}