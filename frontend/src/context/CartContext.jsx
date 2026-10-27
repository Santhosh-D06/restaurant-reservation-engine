import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const EMPTY = { restaurant: null, items: [] };
const load = () => {
  try { return JSON.parse(localStorage.getItem('cart')) || EMPTY; } catch { return EMPTY; }
};

// The cart holds items from ONE restaurant. Prices here are for display only;
// the server recalculates the real total when the order is placed.
export function CartProvider({ children }) {
  const [cart, setCart] = useState(load);

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

  const addItem = (restaurant, item) => {
    const line = { menuItem: item._id, name: item.name, price: item.price, quantity: 1 };
    const rest = { _id: restaurant._id, name: restaurant.name };
    if (cart.items.length && cart.restaurant?._id !== restaurant._id) {
      if (!window.confirm(`Your cart has items from ${cart.restaurant?.name}. Start a new cart with ${restaurant.name}?`)) return;
      setCart({ restaurant: rest, items: [line] });
      return;
    }
    setCart((c) => {
      const exists = c.items.some((i) => i.menuItem === item._id);
      const items = exists
        ? c.items.map((i) => (i.menuItem === item._id ? { ...i, quantity: Math.min(20, i.quantity + 1) } : i))
        : [...c.items, line];
      return { restaurant: rest, items };
    });
  };

  const changeQty = (menuItem, delta) =>
    setCart((c) => {
      const items = c.items
        .map((i) => (i.menuItem === menuItem ? { ...i, quantity: Math.min(20, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0);
      return items.length ? { ...c, items } : EMPTY;
    });

  const removeItem = (menuItem) =>
    setCart((c) => {
      const items = c.items.filter((i) => i.menuItem !== menuItem);
      return items.length ? { ...c, items } : EMPTY;
    });

  const clear = () => setCart(EMPTY);

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, changeQty, removeItem, clear, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}
