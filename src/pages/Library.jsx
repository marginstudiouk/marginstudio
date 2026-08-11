import React, { useState } from 'react';
import { supabase, callFunction } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Download, Package, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Library() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [downloadingId, setDownloadingId] = useState(null);

  const { data: purchases = [], isLoading, refetch } = useQuery({
    queryKey: ['purchases', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*, product:products(name, cover_image_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDownload = async (purchase) => {
    setDownloadingId(purchase.id);
    try {
      const { url } = await callFunction('get-download-link', { purchase_id: purchase.id });
      window.open(url, '_blank', 'noopener');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not generate a download link.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-primary mb-3 block">Account</span>
          <h1 className="font-display text-6xl md:text-8xl tracking-wide text-foreground leading-[0.9] mb-4">
            My<br />Resources
          </h1>
          <p className="text-sm font-sans text-muted-foreground max-w-md leading-relaxed mt-4">
            Your purchased kits, systems, and templates. Each one can be downloaded up to 5 times.
          </p>
          {searchParams.get('checkout') === 'success' && (
            <p className="font-mono text-xs tracking-widest uppercase text-primary mt-6">
              Payment received — your item is below.
            </p>
          )}
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="py-20 border border-dashed border-border text-center grid-overlay">
            <Package className="w-8 h-8 text-muted-foreground/40 mx-auto mb-5" />
            <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-6">
              No resources purchased yet
            </p>
            <Link
              to="/shop"
              className="font-mono text-xs tracking-widest uppercase border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-6 py-3 inline-block"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div>
            {purchases.map((item, i) => {
              const remaining = item.max_downloads - item.download_count;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex items-center justify-between gap-6 py-7 border-b border-border"
                >
                  <div className="flex items-center gap-5">
                    {item.product?.cover_image_url ? (
                      <div className="w-16 h-12 bg-secondary/50 overflow-hidden flex-shrink-0">
                        <img src={item.product.cover_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-12 bg-secondary/50 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="font-sans text-sm font-medium text-foreground">{item.product_name}</h3>
                      <p className="font-mono text-xs text-muted-foreground mt-1">
                        £{item.amount_paid} · {remaining} of {item.max_downloads} downloads left
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {remaining > 0 ? (
                      <button
                        onClick={() => handleDownload(item)}
                        disabled={downloadingId === item.id}
                        className="font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors px-4 py-2 flex items-center gap-2"
                      >
                        {downloadingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        {downloadingId === item.id ? 'Preparing' : 'Download'}
                      </button>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground/50 tracking-widest uppercase">
                        Limit reached
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
