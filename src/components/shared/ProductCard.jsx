import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryLabels = {
  launch_kits: 'Launch kit',
  content_systems: 'Content system',
  branding_kits: 'Branding kit',
  templates: 'Template',
  premade_covers: 'Premade cover',
};

export default function ProductCard({ product, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        {/* Image */}
        <div className="aspect-[4/3] bg-secondary/50 overflow-hidden mb-5 relative">
          {product.cover_image_url ? (
            <img
              src={product.cover_image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center grid-overlay">
              <span className="font-display text-2xl uppercase text-muted-foreground tracking-wide">{product.name}</span>
            </div>
          )}
          {/* Category tag annotation style */}
          {product.category && (
            <div className="absolute top-3 left-3">
              <span className="font-mono text-xs tracking-widest bg-background/80 backdrop-blur-sm text-foreground px-2 py-1">
                {categoryLabels[product.category] || product.category}
              </span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-sans text-base font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
              {product.name}
            </h3>
            <span className="font-mono text-sm text-gold whitespace-nowrap">
              £{product.price}
            </span>
          </div>
          <p className="text-sm font-sans text-muted-foreground leading-relaxed">
            {product.short_description}
          </p>
          <span className="inline-flex items-center font-mono text-xs tracking-widest uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity pt-1">
            View
            <ArrowRight className="w-3 h-3 ml-1.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}