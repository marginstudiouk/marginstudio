import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ResourceCard from '@/components/resources/ResourceCard';

export default function Resources() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['free-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_free', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">
            Free resources
          </span>
          <h1 className="font-display text-6xl md:text-8xl tracking-wide text-foreground mb-4 leading-[0.9]">
            Resources
          </h1>
          <p className="text-sm font-sans text-muted-foreground max-w-md leading-relaxed mt-4">
            A small library of free tools, templates, and guides for authors. Pop your email in once per download — it'll land in your inbox and unlock instantly.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-secondary/50 mb-5" />
                <div className="h-4 bg-secondary/50 w-2/3 mb-2" />
                <div className="h-3 bg-secondary/50 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
              No free resources yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {products.map((product, i) => (
              <ResourceCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
