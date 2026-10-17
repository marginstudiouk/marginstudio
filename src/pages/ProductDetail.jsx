
import React, { useState } from 'react';
import { supabase, callFunction } from '@/lib/supabaseClient';
import { useCart } from '@/lib/CartContext';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2, Mail, Download, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const categoryLabels = {
  diy_kits: 'DIY Kit',
  templates: 'Template',
  premade_covers: 'Premade Cover',
  elements: 'Elements',
};

const STORAGE_KEY = 'margin_subscriber';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  // Free resource email-gate state
  const cachedSubscriber = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  })();

  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState(cachedSubscriber?.email || '');
  const [name, setName] = useState(cachedSubscriber?.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [formError, setFormError] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const variants = Array.isArray(product?.variants)
    ? product.variants
    : [];

  const hasVariants = variants.length > 0;

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) || null;

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariantId) {
      toast.error('Please choose an option first.');
      return;
    }

    addItem(product, selectedVariant);
    toast.success(`${product.name} added to your cart.`);
  };

  const requestDownload = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const { url } = await callFunction('send-subscriber-email', {
        email,
        name: name || undefined,
        product_id: product.id,
      });

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ email, name })
      );

      setDownloadUrl(url);
    } catch (err) {
      setFormError(
        'Something went wrong, try again or email hello@marginstudio.co.uk.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const alreadyKnown =
    !!cachedSubscriber?.email && !downloadUrl && !showForm;

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
        <p className="font-mono text-xs text-muted-foreground tracking-widest">
          Product not found.
        </p>
      </div>
    );
  }

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : hasVariants
      ? Math.min(...variants.map((v) => Number(v.price) || 0))
      : product.price;

  const inCart = isInCart(product.id, selectedVariantId);

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-[4/3] bg-background overflow-hidden relative rounded-[8px]">
              {product.cover_image_url ? (
                <img
                  src={product.cover_image_url}
                  alt={product.name}
                  className={`w-full h-full object-contain ${
                    product.sold_out ? 'opacity-50 grayscale' : ''
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center grid-overlay">
                  <span className="font-display text-3xl uppercase text-muted-foreground tracking-wide">
                    {product.name}
                  </span>
                </div>
              )}

              {product.is_free && (
                <div className="absolute top-3 left-3">
                  <span className="font-mono text-xs tracking-widest bg-background/80 backdrop-blur-sm text-foreground px-2 py-1">
                    Free
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="space-y-8"
          >
            <div>
              <p className="font-mono text-xs tracking-widest uppercase text-primary mb-3">
                {categoryLabels[product.category] ||
                  product.category?.replace(/_/g, ' ')}
              </p>

              <h1 className="font-sans text-2xl md:text-3xl font-semibold text-foreground mb-4 leading-snug">
                {product.name}
              </h1>

              {!product.sold_out && !product.is_free && (
                <p className="font-mono text-xl text-primary">
                  {hasVariants && !selectedVariant
                    ? `From £${displayPrice}`
                    : `£${displayPrice}`}
                </p>
              )}
            </div>

            {product.positioning_statement && (
              <div className="border-l-2 border-primary pl-5">
                <p className="text-sm font-sans text-muted-foreground leading-relaxed italic">
                  {product.positioning_statement}
                </p>
              </div>
            )}

            {product.what_this_is && (
              <div>
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">
                  What this is
                </p>
                <p className="text-sm font-sans text-foreground leading-relaxed whitespace-pre-line">
                  {product.what_this_is}
                </p>
              </div>
            )}

            {product.included_items &&
              product.included_items.length > 0 && (
                <div>
                  <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">
                    What's included
                  </p>

                  <ul className="space-y-2.5">
                    {product.included_items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm font-sans text-foreground"
                      >
                        <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {product.audience && (
              <div>
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">
                  Who it's for
                </p>
                <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                  {product.audience}
                </p>
              </div>
            )}

            {hasVariants && !product.sold_out && (
              <div>
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">
                  Choose an option
                </p>

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
                      <span className="text-sm font-sans text-foreground">
                        {v.label}
                      </span>
                      <span className="font-mono text-sm text-primary">
                        £{v.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.is_free ? (
              <div className="w-full bg-secondary/50 px-6 py-5">
                {downloadUrl ? (
                  <div className="text-center space-y-2">
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3"
                    >
                      <Download className="w-3.5 h-3.5 mr-2" />
                      Download now
                    </a>

                    <p className="text-xs font-sans text-muted-foreground/70">
                      Also on its way to {email}
                    </p>
                  </div>
                ) : alreadyKnown ? (
                  <div className="text-center">
                    {formError && (
                      <p className="text-xs font-sans text-destructive mb-2">
                        {formError}
                      </p>
                    )}

                    <button
                      onClick={requestDownload}
                      disabled={submitting}
                      className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3 disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 mr-2" />
                      )}
                      Get it free
                    </button>
                  </div>
                ) : !showForm ? (
                  <div className="text-center">
                    <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">
                      This is a free resource
                    </p>

                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3"
                    >
                      <Mail className="w-3.5 h-3.5 mr-2" />
                      Get it free
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={requestDownload}
                    className="space-y-2 max-w-sm mx-auto"
                  >
                    {formError && (
                      <p className="text-xs font-sans text-destructive">
                        {formError}
                      </p>
                    )}

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full bg-background border border-border px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-primary"
                    />

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name (optional)"
                      className="w-full bg-background border border-border px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-primary"
                    />

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors px-5 py-3"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          Sending
                        </>
                      ) : (
                        'Join & download'
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : product.sold_out ? (
              <div className="w-full bg-secondary/50 px-6 py-5 text-center">
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                  This item has sold
                </p>
              </div>
            ) : inCart ? (
              <button
                onClick={() => navigate('/cart')}
                className="w-full bg-primary/10 border border-primary text-primary hover:bg-primary/20 transition-colors py-4 font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2"
              >
                <Check className="w-3.5 h-3.5" />
                In your cart — view cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={hasVariants && !selectedVariantId}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors py-4 font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add to cart
              </button>
            )}
          </motion.div>
        </div>

        {product.gallery_urls && product.gallery_urls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16"
          >
            {product.gallery_urls.map((url, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-background overflow-hidden rounded-[8px]"
              >
                <img
                  src={url}
                  alt={`${product.name} ${i + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
