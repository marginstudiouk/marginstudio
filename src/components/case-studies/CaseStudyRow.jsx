import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { services } from '@/lib/servicesData';

export default function CaseStudyRow({ serviceType }) {
  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const items = useMemo(
    () => portfolio.filter((item) => item.service_type === serviceType).slice(0, 3),
    [portfolio, serviceType]
  );

  const alternatives = useMemo(
    () => services.filter((service) => service.slug !== serviceType).slice(0, 3),
    [serviceType]
  );

  if (items.length === 0) {
    return (
      <section className="mb-16">
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-8">
          Other services
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {alternatives.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link
                to={`/services/${service.slug}`}
                className="group block h-full bg-secondary/50 p-7 rounded-[8px] hover:bg-primary transition-colors"
              >
                <h3 className="font-display text-2xl uppercase tracking-wide text-foreground group-hover:text-primary-foreground mb-3 transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm font-sans text-muted-foreground group-hover:text-primary-foreground/80 leading-relaxed transition-colors">
                  {service.shortDescription}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

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
              className="group block relative aspect-square overflow-hidden bg-secondary/50 rounded-[8px]"
            >
              {item.cover_image_url ? (
                <img
                  src={item.cover_image_url}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-6">
                  <span className="font-display text-xl text-muted-foreground tracking-wide text-center">
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
                <h3 className="font-display text-lg text-background leading-tight">
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
