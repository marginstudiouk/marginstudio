import React, { useState } from 'react';
import { supabase, callFunction } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const categoryLabels = {
  diy_kits: 'DIY Kit',
  templates: 'Template',
  premade_covers: 'Premade Cover',
  elements: 'Elements',
};

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();
      if (error) throw error;
      return data;
    },
  });

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const hasVariants = variants.length > 0;
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || null;

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${slug}` } });
      return;
    }

    if (hasVariants && !selectedVariantId) {
      toast.error('Please choose an option first.');
      return;
    }

    setPurchasing(true);
    try {
      const { url } = await callFunction('create-checkout-session', {
        product_id: product.id,
        variant_id: selectedVariantId || undefined,
        origin: window.location.origin,
      });
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
      setPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="font-mono text-xs text-muted-foreground tracking-widest">Product not found.</p>
      </div>
    );
  }

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : hasVariants
    ? Math.min(...variants.map((v) => Number(v.price) || 0))
    : product.price;

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <div className="aspect-[4/3] bg-background overflow-hidden relative rounded-[8px]">
              {product.cover_image_url ? (
                <img
                  src={product.cover_image_url}
                  alt={product.name}
                  className={`w-full h-full object-contain ${product.sold_out ? 'opacity-50 grayscale' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center grid-overlay">
                  <span className="font-display text-3xl uppercase text-muted-foreground tracking-wide">{product.name}</span>
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
            {product.gallery_urls && product.gallery_urls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {product.gallery_urls.map((url, i) => (
                  <div key={i} className="aspect-square bg-background overflow-hidden rounded-[8px]">
                    <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-8">
            <div>
              <p className="font-mono text-xs tracking-widest uppercase text-primary mb-3">
                {categoryLabels[product.category] || product.category?.replace(/_/g, ' ')}
              </p>
              <h1 className="font-sans text-2xl md:text-3xl font-semibold text-foreground mb-4 leading-snug">{product.name}</h1>
              {!product.sold_out && (
                <p className="font-mono text-xl text-primary">
                  {hasVariants && !selectedVariant ? `From £${displayPrice}` : `£${displayPrice}`}
                </p>
              )}
            </div>

            {product.positioning_statement && (
              <div className="border-l-2 border-primary pl-5">
                <p className="text-sm font-sans text-muted-foreground leading-relaxed italic">{product.positioning_statement}</p>
              </div>
            )}

            {product.what_this_is && (
              <div>
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">What this is</p>
                <p className="text-sm font-sans text-foreground leading-relaxed whitespace-pre-line">{product.what_this_is}</p>
              </div>
            )}

            {product.included_items && product.included_items.length > 0 && (
              <div>
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">What's included</p>
                <ul className="space-y-2.5">
                  {product.included_items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-sans text-foreground">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.audience && (
              <div>
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">Who it's for</p>
                <p className="text-sm font-sans text-muted-foreground leading-relaxed">{product.audience}</p>
              </div>
            )}

            {hasVariants && !product.sold_out && (
              <div>
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">Choose an option</p>
                <div className="space-y-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 border text-left transition-colors ${
                        selectedVariantId === v.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <span className="text-sm font-sans text-foreground">{v.label}</span>
                      <span className="font-mono text-sm text-primary">£{v.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.is_free ? (
              <div className="w-full bg-secondary/50 px-6 py-5 text-center">
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">This is a free resource</p>
                <Link to="/resources" className="font-mono text-xs tracking-widest uppercase text-primary border-b border-primary pb-0.5">
                  Get it on the resources page
                </Link>
              </div>
            ) : product.sold_out ? (
              <div className="w-full bg-secondary/50 px-6 py-5 text-center">
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">This item has sold</p>
              </div>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={purchasing || (hasVariants && !selectedVariantId)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors py-4 font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2"
              >
                {purchasing ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Redirecting to checkout</>
                ) : (
                  'Get instant access'
                )}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
