import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../shared/ProductCard';

export default function FeaturedProducts() {
  const { data: products = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
  });

  const paid = products.filter((p) => !p.is_free).slice(0, 3);

  if (paid.length === 0) return null;

  return (
    <section className="border-t border-border py-16 md:py-20 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <p className="font-mono text-xs tracking-widest uppercase text-primary mb-3">Shop</p>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide text-foreground leading-[0.95] mb-5 whitespace-nowrap">
              Prefer something ready-made?
            </h2>
            <p className="text-sm font-sans text-muted-foreground leading-relaxed">
              Browse our ready-made resources for authors, from editable templates to premade book covers, designed to help you present your work strategically and creatively.
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-flex items-center font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors group"
          >
            Explore the shop
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {paid.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="mt-10 md:hidden">
          <Link
            to="/shop"
            className="inline-flex items-center font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors group"
          >
            Explore the shop
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}