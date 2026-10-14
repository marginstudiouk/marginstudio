import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Loader2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { callFunction } from '@/lib/supabaseClient';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setCheckingOut(true);
    try {
      const { url } = await callFunction('create-checkout-session', {
        items: items.map((l) => ({
          product_id: l.product_id,
          variant_id: l.variant_id || undefined,
          quantity: l.quantity,
        })),
        origin: window.location.origin,
      });
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <ShoppingBag className="w-8 h-8 text-muted-foreground mb-5" />
        <h1 className="font-display text-3xl tracking-wide text-foreground mb-3">Your cart is empty</h1>
        <p className="text-sm font-sans text-muted-foreground mb-8 max-w-sm">
          Browse the shop and add something to your cart — it'll be here when you come back.
        </p>
        <Link
          to="/shop"
          className="font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3"
        >
          Browse shop
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-5xl md:text-6xl tracking-wide text-foreground leading-[0.9] mb-12"
        >
          Your cart
        </motion.h1>

        <div className="divide-y divide-border border-y border-border mb-10">
          {items.map((line) => (
            <div key={`${line.product_id}-${line.variant_id || 'base'}`} className="flex items-center gap-5 py-6">
              <Link to={`/product/${line.slug}`} className="shrink-0">
                <div className="w-20 h-20 bg-secondary/50 overflow-hidden rounded-[8px]">
                  {line.cover_image_url ? (
                    <img src={line.cover_image_url} alt={line.name} className="w-full h-full object-contain" />
                  ) : null}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/product/${line.slug}`} className="font-sans text-sm font-medium text-foreground hover:text-primary transition-colors">
                  {line.name}
                </Link>
                {line.variant_label && (
                  <p className="text-xs font-sans text-muted-foreground mt-1">{line.variant_label}</p>
                )}
                <p className="font-mono text-sm text-primary mt-2">£{line.price}</p>
              </div>

              <div className="flex items-center gap-3 border border-border">
                <button
                  type="button"
                  onClick={() => updateQuantity(line.product_id, line.variant_id, line.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-xs w-4 text-center">{line.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(line.product_id, line.variant_id, line.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeItem(line.product_id, line.variant_id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Remove from cart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Subtotal</span>
          <span className="font-mono text-xl text-foreground">£{subtotal.toFixed(2)}</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors py-4 font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2"
        >
          {checkingOut ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Redirecting to checkout</>
          ) : (
            'Checkout'
          )}
        </button>
      </div>
    </div>
  );
}