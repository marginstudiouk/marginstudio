import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ProductCard from '../components/shared/ProductCard';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'launch_kits', label: 'Launch kits' },
  { value: 'content_systems', label: 'Content systems' },
  { value: 'branding_kits', label: 'Branding kits' },
  { value: 'templates', label: 'Templates' },
  { value: 'premade_covers', label: 'Premade covers' },
];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const paidProducts = products.filter(p => !p.is_free);
  const filteredProducts = activeCategory === 'all'
    ? paidProducts
    : paidProducts.filter(p => p.category === activeCategory);

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 relative"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">Shop</span>
          <h1 className="font-display text-6xl md:text-8xl tracking-wide text-foreground mb-4 leading-[0.9]">
            Shop
          </h1>
          <p className="text-sm font-sans text-muted-foreground max-w-md leading-relaxed mt-4">
            Structured systems, kits, and templates built to help authors market their books with clarity and consistency.
          </p>
        </motion.div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-1 mb-14 border-b border-border pb-6">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`font-mono text-xs tracking-widest uppercase px-4 py-2 transition-colors ${
                activeCategory === cat.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-secondary/50 mb-5" />
                <div className="h-4 bg-secondary/50 w-2/3 mb-2" />
                <div className="h-3 bg-secondary/50 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 border border-dashed border-border text-center">
            <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
              No products in this category yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}