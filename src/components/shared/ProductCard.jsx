import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryLabels = {
  diy_kits: 'DIY Kit',
  templates: 'Template',
  premade_covers: 'Premade Cover',
  elements: 'Elements',
};

export default function ProductCard({ product, index = 0 }) {
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const displayPrice = hasVariants
    ? Math.min(...product.variants.map((v) => Number(v.price) || 0))
    : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="aspect-[4/3] bg-secondary/50 overflow-hidden mb-5 relative">
          {product.cover_image_url ? (
            <img
              src={product.cover_image_url}
              alt={product.name}
              className={`w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.04] ${product.sold_out ? 'opacity-50 grayscale' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center grid-overlay">
              <span className="font-display text-2xl uppercase text-muted-foreground tracking-wide">{product.name}</span>
            </div>
          )}
          {product.category && (
            <div className="absolute top-3 left-3">
              <span className="font-mono text-xs tracking-widest bg-background/80 backdrop-blur-sm text-foreground px-2 py-1">
                {categoryLabels[product.category] || product.category}
              </span>
            </div>
          )}
          {product.sold_out && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40">
              <span className="font-mono text-sm tracking-widest uppercase bg-foreground text-background px-4 py-2">
                Sold out
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-sans text-base font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
              {product.name}
            </h3>
            {!product.sold_out && (
              <span className="font-mono text-sm text-gold whitespace-nowrap">
                {hasVariants ? `From £${displayPrice}` : `£${displayPrice}`}
              </span>
            )}
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
