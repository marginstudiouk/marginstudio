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
          className="font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90