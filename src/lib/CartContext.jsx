import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext();
const STORAGE_KEY = 'margin_cart';

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// A cart line is uniquely identified by product_id + variant_id (variant_id is
// null for products with no variants).
function sameLine(a, productId, variantId) {
  return a.product_id === productId && (a.variant_id || null) === (variantId || null);
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => readStoredCart());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage failures (private browsing, quota, etc.)
    }
  }, [items]);

  const addItem = useCallback((product, variant, quantity = 1) => {
    setItems((prev) => {
      const variantId = variant?.id || null;
      const existing = prev.find((l) => sameLine(l, product.id, variantId));
      if (existing) {
        return prev.map((l) =>
          sameLine(l, product.id, variantId) ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          slug: product.slug,
          name: product.name,
          cover_image_url: product.cover_image_url,
          category: product.category,
          variant_id: variantId,
          variant_label: variant?.label || null,
          price: variant ? Number(variant.price) : Number(product.price),
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId, variantId) => {
    setItems((prev) => prev.filter((l) => !sameLine(l, productId, variantId)));
  }, []);

  const updateQuantity = useCallback((productId, variantId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((l) => !sameLine(l, productId, variantId));
      return prev.map((l) => (sameLine(l, productId, variantId) ? { ...l, quantity } : l));
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(() => items.reduce((sum, l) => sum + l.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, l) => sum + l.price * l.quantity, 0), [items]);

  const isInCart = useCallback(
    (productId, variantId) => items.some((l) => sameLine(l, productId, variantId)),
    [items]
  );

  const value = { items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, isInCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}