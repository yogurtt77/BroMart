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

export const changeCartQuantity = (id, delta) => {
  const items = getCartItems();
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return;

  const next = (items[idx].quantity || 0) + delta;
  if (next <= 0) {
    items.splice(idx, 1);
  } else {
    items[idx] = { ...items[idx], quantity: next };
  }
  saveCartItems(items);
  window.dispatchEvent(new Event('cartUpdated'));
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cartUpdated'));
};

export const getCartCount = () => {
  const items = getCartItems();

  return items.reduce((sum, item) => {
    const qty = item.quantity || 0;

    return sum + qty;
  }, 0);
};

