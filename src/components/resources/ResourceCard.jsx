import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, Mail } from 'lucide-react';
import { callFunction } from '@/lib/supabaseClient';

const STORAGE_KEY = 'margin_subscriber';

export default function ResourceCard({ product, index = 0 }) {
  const cached = (() => {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  })();

  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState(cached?.email || '');
  const [name, setName] = useState(cached?.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState('');

  const requestDownload = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { url } = await callFunction('send-subscriber-email', {
        email,
        name: name || undefined,
        product_id: product.id,
      });
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ email, name }));
      setDownloadUrl(url);
    } catch (err) {
      setError('Something went wrong — try again or email hello@marginstudio.co.uk.');
    } finally {
      setSubmitting(false);
    }
  };

  // Already know their email from a previous resource this session — skip the form.
  const alreadyKnown = !!cached?.email && !downloadUrl && !showForm;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="flex flex-col"
    >
      <div className="aspect-[4/3] bg-secondary/50 overflow-hidden mb-5 relative">
        {product.cover_image_url ? (
          <img src={product.cover_image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-2xl text-muted-foreground tracking-wide">{product.name}</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="font-mono text-xs tracking-widest bg-background/80 backdrop-blur-sm text-foreground px-2 py-1">Free</span>
        </div>
      </div>

      <div className="space-y-2 flex-1 flex flex-col">
        <h3 className="font-sans text-base font-medium text-foreground leading-snug">{product.name}</h3>
        <p className="text-sm font-sans text-muted-foreground leading-relaxed flex-1">{product.short_description}</p>

        <div className="pt-3">
          {error && <p className="text-xs font-sans text-destructive mb-2">{error}</p>}

          {downloadUrl ? (
            <div className="space-y-1.5">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center font-mono text-xs tracking-widest uppercase border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-5 py-3"
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                Download now
              </a>
              <p className="text-xs font-sans text-muted-foreground/70">Also on its way to {email}</p>
            </div>
          ) : alreadyKnown ? (
            <button
              onClick={requestDownload}
              disabled={submitting}
              className="inline-flex items-center font-mono text-xs tracking-widest uppercase border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-5 py-3 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-2" />}
              Get it free
            </button>
          ) : !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center font-mono text-xs tracking-widest uppercase border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-5 py-3"
            >
              <Mail className="w-3.5 h-3.5 mr-2" />
              Get it free
            </button>
          ) : (
            <form onSubmit={requestDownload} className="space-y-2">
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
      </div>
    </motion.div>
  );
}
