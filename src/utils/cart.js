const CART_KEY = 'cartItems';

export const getCartItems = () => {
  try {
    const data = localStorage.getItem(CART_KEY);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (e) {
    return [];
  }
};

const saveCartItems = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const addToCart = (product) => {
  const items = getCartItems();
  const index = items.findIndex((item) => item.id === product.id);

  if (index !== -1) {
    items[index] = {
      ...items[index],
      quantity: (items[index].quantity || 0) + 1
    };
  } else {
    items.push({
      ...product,
      quantity: 1
    });
  }

  saveCartItems(items);

  window.dispatchEvent(new Event('cartUpdated'));
};

export const getCartCount = () => {
  const items = getCartItems();

  return items.reduce((sum, item) => {
    const qty = item.quantity || 0;

    return sum + qty;
  }, 0);
};

