import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';

export default function CaseStudyRow({ serviceType }) {
  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const items = useMemo(() => {
    const matching = portfolio.filter((p) => p.service_type === serviceType);
    const shuffled = [...matching].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [portfolio, serviceType]);

  if (items.length === 0) return null;

  return (
    <section className="mb-16">
      <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-8">
        Selected work
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <Link
              to={`/case-studies/${item.slug}`}
              className="group block relative aspect-square overflow-hidden bg-secondary/50"
            >
              {item.cover_image_url ? (
                <img
                  src={item.cover_image_url}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-xl text-muted-foreground tracking-wide">
                    {item.name}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {item.client && (
                  <p className="font-mono text-[10px] tracking-widest uppercase text-background/70 mb-1.5">
                    {item.client}
                  </p>
                )}
                <h3 className="font-display text-lg text-background leading-tight group-hover:text-gold transition-colors">
                  {item.name}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}